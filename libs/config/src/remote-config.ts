import { createDecipheriv } from "node:crypto";
import { formatWithOptions } from "node:util";
import mongoose from "mongoose";

// Settings from the Robtic admin console. The container keeps only three values:
//   ROBTIC_CONFIG_MONGO_URI  where the settings are (the config database)
//   ROBTIC_CONFIG_KEY        the key they're encrypted with (32 bytes, base64)
//   ROBTIC_BOT               which bot this is (system | staff | ticket)
// Everything else (the token, this bot's own database, every other variable) is read here, decrypted and put into
// process.env before the rest of the bot loads, so the existing code reads it exactly as before. Without those three
// values this does nothing and the bot uses its environment as it always did.
//
// Values are AES-256-GCM `v1.<iv>.<tag>.<data>` (base64), written by robtic-discord (libs/server/src/secure-config.ts).
// This file is the same in robtic-system, robtic-staff and Robtic Ticket (only DEFAULT_BOT and the token wait differ).
// Robtic Ticket imports it first in apps/bot/src/bot.ts and apps/transcript/server.ts.

const URI = process.env.ROBTIC_CONFIG_MONGO_URI?.trim();
const KEY = process.env.ROBTIC_CONFIG_KEY?.trim();
/** Which bot this file belongs to when ROBTIC_BOT isn't set (the only line that differs between the two bots). */
const DEFAULT_BOT = "ticket";
const BOT = process.env.ROBTIC_BOT?.trim() || DEFAULT_BOT;
const REMOTE = !!(process.env.ROBTIC_CONFIG_MONGO_URI?.trim() && process.env.ROBTIC_CONFIG_KEY?.trim());
const COLLECTION = process.env.ROBTIC_CONFIG_COLLECTION?.trim() || "discord_bot_config";
/** How often the blocked-server list is read again. */
const REFRESH_MS = 60_000;

interface ConfigDoc {
  _id: string;
  env?: Record<string, string>;
  blacklist?: { guildId: string }[];
  /** Emoji slot -> emoji, set in the admin console (Discord -> Emojis). Plain text, not encrypted. */
  emojis?: Record<string, string>;
  /** Set by the admin console's Restart: every process started before it exits and comes back. */
  restartAt?: string;
}

let blocked = new Set<string>();
const listeners = new Set<(ids: string[]) => void>();

let emojis: Record<string, string> = {};

/* ------------------------------------------------------------------ which servers this bot may be in */

// One list for every Robtic bot, kept in the admin console (Discord → Allowed servers) in the config store's `admin`
// document: `servers` (the allowed servers) and `openBots` (bots open to every server, the list doesn't apply).
// Until that list exists (`servers` missing) nothing is decided here: isGuildAllowed answers null and the bot keeps
// its old behaviour, so a bot never leaves every server because the list hasn't been saved yet.

interface AccessDoc { servers?: { guildId: string }[]; openBots?: string[] }
let access: { configured: boolean; open: boolean; servers: Set<string> } = { configured: false, open: false, servers: new Set() };
const accessListeners = new Set<() => void>();

/** false: leave (blocked, or not on the list and the bot isn't open to everyone). true: may stay. null: no list yet. */
export function isGuildAllowed(guildId: string): boolean | null {
  if (blocked.has(guildId)) return false;
  if (!access.configured) return null;
  return access.open || access.servers.has(guildId);
}

/** Called when the list or this bot's "open to everyone" changes (so the bot can leave servers no longer allowed). */
export function onAccessChange(fn: () => void): void {
  accessListeners.add(fn);
}

function applyAccess(d: AccessDoc | null): boolean {
  const next = {
    configured: Array.isArray(d?.servers),
    open: Array.isArray(d?.openBots) && d!.openBots!.includes(BOT),
    servers: new Set((d?.servers ?? []).map((s) => s.guildId)),
  };
  const changed = next.configured !== access.configured || next.open !== access.open
    || next.servers.size !== access.servers.size || [...next.servers].some((id) => !access.servers.has(id));
  access = next;
  return changed;
}

/** The emoji the admin console put in this slot, or undefined to use the bot's default. */
export const getEmojiOverride = (key: string): string | undefined => emojis[key] || undefined;

/** Whether the admin console blocked this server for this bot. */
export const isGuildBlocked = (guildId: string): boolean => blocked.has(guildId);

/** Called with the whole list whenever it changes (so the bot can leave newly blocked servers). */
export function onBlockedChange(fn: (ids: string[]) => void): void {
  listeners.add(fn);
}

function decrypt(value: string, key: Uint8Array): string {
  const [v, iv, tag, data] = value.split(".");
  // An empty value encrypts to an empty data part, so only a missing part is wrong.
  if (v !== "v1" || !iv || !tag || data === undefined) throw new Error("unknown format");
  const d = createDecipheriv("aes-256-gcm", key, new Uint8Array(Buffer.from(iv, "base64")));
  d.setAuthTag(new Uint8Array(Buffer.from(tag, "base64")));
  return Buffer.concat([d.update(new Uint8Array(Buffer.from(data, "base64"))), d.final()] as unknown as Uint8Array[]).toString("utf8");
}

/* ------------------------------------------------------------------ restart and logs, from the admin console */

// The admin console can restart a bot (Discord → Bot settings → Restart) and read its recent output, without touching
// Docker or Portainer: it writes `restartAt` on the bot's document, which every process of the bot checks every few
// seconds and answers by exiting cleanly (the containers restart themselves: `restart: unless-stopped`). Output is
// copied into a small capped collection the console reads.

const STARTED_AT = Date.now();
const RESTART_CHECK_MS = 10_000;
const LOG_COLLECTION = process.env.ROBTIC_LOG_COLLECTION?.trim() || "discord_bot_logs";
const LOG_FLUSH_MS = 3_000;
const LOG_LINE_MAX = 2_000;
const LOG_BUFFER_MAX = 1_000;
/** Which process of the bot a line came from: the Gateway's role, a worker, an internal API, or the bot itself. */
const LOG_SOURCE = process.env.ROBTIC_LOG_SOURCE?.trim()
  || process.env.GATEWAY_ROLE?.trim()
  || (/worker/.test(process.argv[1] ?? "") ? `worker:${process.env.HOSTNAME ?? ""}`.replace(/:$/, "") : /internal-api/.test(process.argv[1] ?? "") ? "internal-api" : BOT);

let flushLogs: (() => Promise<void>) | null = null;

function startLogShipping(conn: mongoose.Connection): void {
  const pending: { bot: string; source: string; at: Date; stream: "out" | "err"; line: string }[] = [];
  let partial = { out: "", err: "" };
  // eslint-disable-next-line no-control-regex
  const strip = (s: string) => s.replace(/\x1b\[[0-9;]*m/g, "");

  const record = (stream: "out" | "err", chunk: unknown) => {
    try {
      const text = partial[stream] + (typeof chunk === "string" ? chunk : Buffer.from(chunk as Uint8Array).toString("utf8"));
      const lines = text.split("\n");
      partial[stream] = lines.pop() ?? "";
      for (const raw of lines) {
        const line = strip(raw).trimEnd();
        if (!line) continue;
        pending.push({ bot: BOT, source: LOG_SOURCE, at: new Date(), stream, line: line.slice(0, LOG_LINE_MAX) });
      }
      if (pending.length > LOG_BUFFER_MAX) pending.splice(0, pending.length - LOG_BUFFER_MAX);
    } catch {
      // Never let copying a log line break the write itself.
    }
  };

  // Bun's console writes straight to the terminal without going through process.stdout.write, so both are copied;
  // `inConsole` keeps a runtime that does route console through write (Node) from copying a line twice.
  let inConsole = false;
  const wrapWrite = (stream: "out" | "err", original: typeof process.stdout.write) =>
    function (this: unknown, chunk: unknown, ...rest: unknown[]) {
      if (!inConsole) record(stream, chunk);
      return (original as (...a: unknown[]) => boolean)(chunk, ...rest);
    } as typeof process.stdout.write;
  process.stdout.write = wrapWrite("out", process.stdout.write.bind(process.stdout));
  process.stderr.write = wrapWrite("err", process.stderr.write.bind(process.stderr));

  for (const [method, stream] of [["log", "out"], ["info", "out"], ["debug", "out"], ["warn", "err"], ["error", "err"]] as const) {
    const original = console[method].bind(console);
    console[method] = (...args: unknown[]) => {
      record(stream, `${formatWithOptions({ colors: false }, ...args)}\n`);
      inConsole = true;
      try {
        original(...args);
      } finally {
        inConsole = false;
      }
    };
  }

  const ready = conn
    .createCollection(LOG_COLLECTION, { capped: true, size: 32 * 1024 * 1024, max: 100_000 })
    .catch(() => null) // already there
    .then(() => conn.collection(LOG_COLLECTION).createIndex({ bot: 1, at: -1 }).catch(() => null));

  flushLogs = async () => {
    if (!pending.length) return;
    const batch = pending.splice(0, pending.length);
    await ready;
    await conn.collection(LOG_COLLECTION).insertMany(batch, { ordered: false }).catch(() => null);
  };
  const timer = setInterval(() => void flushLogs?.(), LOG_FLUSH_MS);
  timer.unref?.();
}

function watchRestart(read: () => Promise<ConfigDoc | null>): void {
  const timer = setInterval(async () => {
    try {
      const at = Date.parse(String((await read())?.restartAt ?? ""));
      // Only a request made after this process started: the restarted process sees the same value and carries on.
      if (!Number.isFinite(at) || at <= STARTED_AT) return;
      console.log(`[remote-config] restart requested from the admin console (${new Date(at).toISOString()}), restarting.`);
      clearInterval(timer);
      await flushLogs?.().catch(() => null);
      process.exit(0);
    } catch {
      // The database is back next time.
    }
  }, RESTART_CHECK_MS);
  timer.unref?.();
}

let reloadEnv: (() => Promise<void>) | null = null;

if (URI && KEY && REMOTE) {
  const key = new Uint8Array(Buffer.from(KEY, "base64"));
  if (key.length !== 32) throw new Error("[remote-config] ROBTIC_CONFIG_KEY must be 32 bytes, base64.");

  const conn = await mongoose.createConnection(URI, { serverSelectionTimeoutMS: 20_000 }).asPromise();
  const read = () => conn.collection<ConfigDoc>(COLLECTION).findOne({ _id: BOT } as never) as Promise<ConfigDoc | null>;
  // No settings yet is fine: the bot waits for its token below instead of failing.
  const doc: ConfigDoc = (await read()) ?? { _id: BOT };

  const apply = (d: ConfigDoc): number => {
    let n = 0;
    for (const [name, value] of Object.entries(d.env ?? {})) {
      try {
        process.env[name] = decrypt(value, key);
        n++;
      } catch {
        // Never print the value. A wrong key fails every variable, so stop rather than run half-configured.
        throw new Error(`[remote-config] could not decrypt ${name}: is ROBTIC_CONFIG_KEY right?`);
      }
    }
    return n;
  };
  const count = apply(doc);
  reloadEnv = async () => { const d = await read(); if (d) apply(d); };
  blocked = new Set((doc.blacklist ?? []).map((b) => b.guildId));
  const readAccess = () => conn.collection<AccessDoc & { _id: string }>(COLLECTION).findOne({ _id: "admin" } as never, { projection: { servers: 1, openBots: 1 } }) as Promise<AccessDoc | null>;
  applyAccess(await readAccess().catch(() => null));
  emojis = { ...(doc.emojis ?? {}) };
  console.log(`[remote-config] ${count} settings loaded for ${BOT}, ${blocked.size} blocked server(s).`);

  const timer = setInterval(async () => {
    try {
      const fresh = await read();
      emojis = { ...(fresh?.emojis ?? {}) };
      const next = new Set((fresh?.blacklist ?? []).map((b) => b.guildId));
      const changed = next.size !== blocked.size || [...next].some((id) => !blocked.has(id));
      blocked = next;
      if (changed) for (const fn of listeners) fn([...next]);
      // The shared allowlist: only a read that worked can change it (a failed one throws above or below, never empties it).
      const acc = await readAccess();
      if (applyAccess(acc)) for (const fn of accessListeners) fn();
    } catch (err) {
      console.warn("[remote-config] could not refresh the blocked servers and emojis", err);
    }
  }, REFRESH_MS);
  timer.unref?.();

  startLogShipping(conn);
  watchRestart(() => conn.collection<ConfigDoc>(COLLECTION).findOne({ _id: BOT } as never, { projection: { restartAt: 1 } }) as Promise<ConfigDoc | null>);
}

/* ------------------------------------------------------------------ no token yet: wait quietly */

// A bot without its Discord token used to crash and restart over and over. Now it waits: with the config store it
// checks every 30 seconds and starts as soon as a token is saved in the admin console; without it, it says so once and
// idles until restarted. Its health check stays green meanwhile, so nothing flaps.

const TOKEN_KEY = "DISCORD_TOKEN";
/** Only the bot logs in to Discord; the transcript page needs the database only. */
const NEEDS_TOKEN = /apps[\/\\]bot[\/\\]/.test(process.argv[1] ?? "");

if (NEEDS_TOKEN && !process.env[TOKEN_KEY]?.trim()) {
  console.log(`[remote-config] no Discord token yet (${TOKEN_KEY}): waiting${reloadEnv ? " for it to be set in the admin console" : ""}.`);
  const healthy = keepHealthy();
  await new Promise<void>((resolve) => {
    const timer = setInterval(async () => {
      if (!reloadEnv) return; // nothing can change until the container restarts with a token
      try {
        await reloadEnv();
      } catch {
        return; // the database is back next time
      }
      if (process.env[TOKEN_KEY]?.trim()) {
        clearInterval(timer);
        resolve();
      }
    }, 30_000);
  });
  healthy();
  console.log("[remote-config] token found, starting.");
}

/** Keeps the container's health check green while waiting; returns a function that stops doing so. */
function keepHealthy(): () => void {
  // A timestamp a health check can read while the bot waits for its token.
  const touch = () => { void Bun.write("/tmp/bot-health", String(Date.now())).catch(() => {}); };
  touch();
  const timer = setInterval(touch, 20_000);
  return () => clearInterval(timer);
}
