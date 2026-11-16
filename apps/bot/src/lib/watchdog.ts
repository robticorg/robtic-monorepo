import { Events, Status, type Client } from "discord.js";
import { Logger } from "@robo/logger";

// Keeps the bot from sitting offline. On 2026-11-16 it went offline right after a ticket was opened and claimed, with
// nothing in its logs, until someone restarted the container by hand. So:
//   1. Everything about the Gateway connection (drops, reconnects, errors) and any uncaught error is logged.
//   2. If the connection isn't back within a few minutes, the process exits and Docker starts it again.
//   3. If the process itself freezes (nothing runs, so 2 can't either), a worker thread notices the missing heartbeat
//      and kills it, for the same restart.

const OFFLINE_LIMIT_MS = 3 * 60_000;
const BEAT_MS = 5_000;
const FROZEN_LIMIT_MS = 90_000;

export function startWatchdog(client: Client): void {
    process.on("unhandledRejection", (reason) => Logger.error("[watchdog] unhandled rejection", reason));
    process.on("uncaughtException", (err) => Logger.error("[watchdog] uncaught exception", err));

    client.on(Events.ShardDisconnect, (e, id) => Logger.warn(`[watchdog] gateway ${id} disconnected (code ${e.code})`));
    client.on(Events.ShardReconnecting, (id) => Logger.warn(`[watchdog] gateway ${id} reconnecting`));
    client.on(Events.ShardResume, (id, replayed) => Logger.info(`[watchdog] gateway ${id} resumed (${replayed} events replayed)`));
    client.on(Events.ShardError, (err, id) => Logger.error(`[watchdog] gateway ${id} error`, err));
    client.on(Events.Invalidated, () => Logger.error("[watchdog] session invalidated"));
    client.rest.on("rateLimited", (r) => {
        // Long waits are what make a bot look frozen: say which route.
        if (r.timeToReset > 5_000) Logger.warn(`[watchdog] rate limited ${Math.round(r.timeToReset / 1000)}s on ${r.method} ${r.route}`);
    });

    // 2. The connection.
    let offlineSince: number | null = null;
    const check = setInterval(() => {
        if (!client.readyAt) return; // not logged in yet
        if (client.ws.status === Status.Ready) {
            offlineSince = null;
            return;
        }
        offlineSince ??= Date.now();
        if (Date.now() - offlineSince > OFFLINE_LIMIT_MS) {
            Logger.error(`[watchdog] gateway not ready for ${Math.round((Date.now() - offlineSince) / 1000)}s (status ${client.ws.status}), restarting`);
            process.exit(1);
        }
    }, 30_000);
    check.unref?.();

    // 3. The process.
    const beat = new Int32Array(new SharedArrayBuffer(4));
    const stamp = () => Atomics.store(beat, 0, Math.floor(Date.now() / 1000));
    stamp();
    const heart = setInterval(stamp, BEAT_MS);
    heart.unref?.();
    try {
        const worker = new Worker(new URL("./watchdog-worker.ts", import.meta.url));
        worker.postMessage({ beat, limitMs: FROZEN_LIMIT_MS, pid: process.pid });
        (worker as Worker & { unref?: () => void }).unref?.();
    } catch (err) {
        Logger.warn(`[watchdog] freeze check unavailable: ${err}`);
    }
}
