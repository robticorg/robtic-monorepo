import { AuditLogEvent, type Guild } from "discord.js";
import { Logger } from "@robo/logger";
import { TicketRepository, TranscriptRepository } from "@robo/db";
import type { DeletedBy, ReactionEmoji } from "@robo/shared";
import { toMessageSnapshot, type MessageLike } from "./mapper";

// Records everything that happens to messages in ticket channels while a ticket lives: sent, edited (with what it said
// before), deleted (and by whom, from the audit log), reactions added and removed. Only ticket channels: other channels
// are never stored, and the audit log is never read for them. Failures are logged, never thrown into the gateway.

const tickets = new TicketRepository();
const transcripts = new TranscriptRepository();

/** Ticket channels, remembered for a minute so every message doesn't ask the database. */
const known = new Map<string, { at: number; is: boolean }>();
export async function isTicketChannel(channelId: string): Promise<boolean> {
    const hit = known.get(channelId);
    if (hit && Date.now() - hit.at < 60_000) return hit.is;
    const is = await tickets.isTicket(channelId);
    known.set(channelId, { at: Date.now(), is });
    if (known.size > 5000) known.clear();
    return is;
}
/** A channel became a ticket (or stopped being one): forget what was remembered. */
export const forgetChannel = (channelId: string) => known.delete(channelId);

function store(message: MessageLike, guildId: string) {
    const s = toMessageSnapshot(message, guildId);
    return {
        guildId: s.guildId,
        channelId: s.channelId,
        author: s.author,
        content: s.content,
        type: s.type,
        flags: s.flags,
        messageCreatedAt: s.createdAt ? new Date(s.createdAt) : null,
        editedAt: s.editedAt ? new Date(s.editedAt) : null,
        referenceMessageId: s.referenceMessageId,
        isBot: s.author?.bot ?? false,
        isSystem: s.system ?? false,
        mentions: s.mentions,
        embeds: s.embeds,
        components: s.components ?? [],
        stickers: s.stickers,
        attachments: s.attachments,
        incompleteFields: s.incompleteFields,
    };
}

export async function captureCreated(message: MessageLike) {
    if (!message.guildId || !(await isTicketChannel(message.channelId))) return;
    await transcripts.upsertMessage(message.id, store(message, message.guildId)).catch((e) => Logger.warn(`[transcript] create ${message.id}: ${e}`));
}

export async function captureUpdated(before: MessageLike, after: MessageLike) {
    if (!after.guildId || !(await isTicketChannel(after.channelId))) return;
    // Discord also "updates" a message when it unfurls a link: only real edits count.
    if (!before.partial && !after.partial && before.editedTimestamp === after.editedTimestamp && before.content === after.content) return;
    const previous = before.partial ? null : before.content;
    try {
        const stored = previous ?? (await transcripts.messages(after.channelId)).find((m) => m.messageId === after.id)?.content ?? null;
        await transcripts.edit(after.channelId, after.id, stored, after.partial ? null : after.content);
        await transcripts.upsertMessage(after.id, store(after, after.guildId), true);
    } catch (e) {
        Logger.warn(`[transcript] edit ${after.id}: ${e}`);
    }
}

/** Discord writes the audit entry a moment after the delete event. */
const AUDIT_DELAY_MS = 1500;
const counts = new Map<string, number>();

/**
 * Who deleted a message. Discord writes a MESSAGE_DELETE audit entry only when someone deletes another person's
 * message, and folds repeats into one entry whose count grows. No matching entry: the author deleted it.
 */
async function deleterOf(guild: Guild, channelId: string, authorId: string | null): Promise<DeletedBy> {
    if (!authorId) return { userId: null, kind: "unknown" };
    try {
        await new Promise((r) => setTimeout(r, AUDIT_DELAY_MS));
        const logs = await guild.fetchAuditLogs({ type: AuditLogEvent.MessageDelete, limit: 10 });
        let match: { executorId: string | null } | null = null;
        let ambiguous = false;
        for (const e of logs.entries.values()) {
            const extra = e.extra as { channel?: { id: string }; count?: number } | null;
            if (e.targetId !== authorId || extra?.channel?.id !== channelId) continue;
            const count = extra?.count ?? 1;
            const previous = counts.get(e.id);
            counts.set(e.id, count);
            if (previous !== undefined ? count > previous : Date.now() - e.createdTimestamp < 15_000) match ??= e;
            else if (previous === undefined) ambiguous = true;
        }
        if (counts.size > 5000) counts.clear();
        if (match?.executorId) return { userId: match.executorId, kind: match.executorId === guild.members.me?.id ? "bot" : "moderator" };
        return ambiguous ? { userId: null, kind: "unknown" } : { userId: authorId, kind: "self" };
    } catch {
        // No View Audit Log permission: can't tell.
        return { userId: null, kind: "unknown" };
    }
}

export async function captureDeleted(message: MessageLike, guild: Guild | null) {
    if (!message.guildId || !(await isTicketChannel(message.channelId))) return;
    const authorId = message.author?.id ?? (await transcripts.authorOf(message.id));
    const by = guild ? await deleterOf(guild, message.channelId, authorId) : { userId: authorId, kind: authorId ? ("self" as const) : ("unknown" as const) };
    // A message sent before the bot saw it (uncached): keep what Discord still gave us.
    if (!message.partial) await transcripts.upsertMessage(message.id, store(message, message.guildId)).catch(() => null);
    await transcripts.markDeleted(message.id, message.channelId, message.guildId, by).catch((e) => Logger.warn(`[transcript] delete ${message.id}: ${e}`));
}

export async function captureBulkDeleted(messages: MessageLike[], guild: Guild, channelId: string) {
    if (!(await isTicketChannel(channelId))) return;
    let by: DeletedBy = { userId: null, kind: "unknown" };
    try {
        await new Promise((r) => setTimeout(r, AUDIT_DELAY_MS));
        const logs = await guild.fetchAuditLogs({ type: AuditLogEvent.MessageBulkDelete, limit: 5 });
        const entry = [...logs.entries.values()].find((e) => e.targetId === channelId && Date.now() - e.createdTimestamp < 30_000);
        if (entry?.executorId) by = { userId: entry.executorId, kind: entry.executorId === guild.members.me?.id ? "bot" : "moderator" };
    } catch {
        // keep unknown
    }
    for (const m of messages) await transcripts.markDeleted(m.id, channelId, guild.id, by).catch(() => null);
}

export async function captureReaction(channelId: string, messageId: string, emoji: ReactionEmoji, userId: string, add: boolean) {
    if (!(await isTicketChannel(channelId))) return;
    await transcripts.react(messageId, emoji, userId, add).catch(() => null);
}

export async function captureReactionsCleared(channelId: string, messageId: string) {
    if (!(await isTicketChannel(channelId))) return;
    await transcripts.clearReactions(messageId).catch(() => null);
}
