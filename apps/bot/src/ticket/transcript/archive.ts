import { randomBytes } from "node:crypto";
import type { Guild } from "discord.js";
import env from "@robo/config";
import { Logger } from "@robo/logger";
import { SettingsRepository, TicketRepository, TranscriptRepository, type TranscriptMessageDoc } from "@robo/db";
import { resolvePlaces, t, TRANSCRIPT_FORMAT, type TicketTranscriptDocument, type TranscriptMessage, type TranscriptMessageView, type TranscriptUser } from "@robo/shared";
import { exportFilename, transcriptHtml } from "@robo/transcript/html";
import { keepPictures } from "./r2";
import { renderMessage, type Row } from "@/lib/messagePayload";

// A ticket's transcript: every captured message folded into one self-contained document (Credora's archive builder,
// adapted to tickets), saved under an unguessable id, then sent where the server wants it: the transcript channel, the
// owner's DMs. Each copy carries the link to the transcript page (when TRANSCRIPT_BASE_URL is set) and the HTML file.
//
// It goes out once: at the ticket's first close. That version is also kept as the owner's copy, which the owner (and a
// public link) keeps seeing on the same page; later saves (reopened, closed again, deleted) only update the full copy
// the server's administrators see, and send nothing.

const tickets = new TicketRepository();
const transcripts = new TranscriptRepository();
const settings = new SettingsRepository();

const ALPHABET = "abcdefghijkmnopqrstuvwxyz23456789";
/** `tr_` + 32 characters from a 33-letter alphabet without look-alikes: about 160 bits. */
export const newTranscriptId = () => `tr_${[...randomBytes(32)].map((b) => ALPHABET[b % ALPHABET.length]).join("")}`;

export const transcriptUrl = (id: string) => (env.transcriptBaseUrl ? `${env.transcriptBaseUrl}/${id}` : null);

const iso = (d: Date | string | null | undefined) => (d ? new Date(d).toISOString() : null);

/** A message counts when a person wrote it and it has text, files or stickers; bot cards don't. */
const counts = (m: TranscriptMessageView) => !m.isBot && (Boolean(m.content?.trim()) || m.attachments.length > 0 || m.stickers.length > 0);

export async function buildDocument(guild: Guild, channelId: string, transcriptId: string): Promise<TicketTranscriptDocument | null> {
    const ticket = await tickets.byChannel(channelId);
    if (!ticket) return null;
    const s = await settings.get(guild.id);
    const [rows, edits] = await Promise.all([transcripts.messages(channelId), transcripts.edits(channelId)]);

    const users: Record<string, TranscriptUser> = {};
    for (const m of rows) {
        const a = m.author as { id: string; username: string | null; displayName: string | null; globalName: string | null; avatarUrl: string | null; bot: boolean } | null;
        if (a) users[a.id] = { id: a.id, username: a.username, displayName: a.displayName ?? a.globalName ?? a.username, avatarUrl: a.avatarUrl, bot: a.bot };
    }
    // People who never wrote (added, reacted, deleted others' messages): their names from Discord, best effort.
    const others = new Set<string>(ticket.participants.map((p) => p.userId ?? "").filter(Boolean));
    if (ticket.claimerId) others.add(ticket.claimerId);
    if (ticket.closedBy) others.add(ticket.closedBy);
    for (const m of rows) {
        for (const r of (m.reactions as { userIds: string[] }[]) ?? []) r.userIds.forEach((id) => others.add(id));
        const by = (m.deletedBy as { userId?: string | null } | null)?.userId;
        if (by) others.add(by);
    }
    for (const id of [...others].slice(0, 100)) {
        if (users[id]) continue;
        const member = await guild.members.fetch(id).catch(() => null);
        const user = member?.user ?? (await guild.client.users.fetch(id).catch(() => null));
        users[id] = { id, username: user?.username ?? null, displayName: member?.displayName ?? user?.globalName ?? user?.username ?? null, avatarUrl: user?.displayAvatarURL() ?? null, bot: user?.bot ?? false };
    }

    const editsOf = new Map<string, TranscriptMessageView["editHistory"]>();
    for (const e of edits) {
        const list = editsOf.get(e.messageId) ?? [];
        list.push({ at: iso(e.at), before: e.before ?? null, after: e.after ?? null });
        editsOf.set(e.messageId, list);
    }

    const view = (m: TranscriptMessageDoc): TranscriptMessageView => ({
        messageId: m.messageId,
        authorId: (m.author as { id?: string } | null)?.id ?? null,
        content: m.content ?? null,
        createdAt: iso(m.messageCreatedAt),
        editedAt: iso(m.editedAt),
        deleted: m.deleted,
        deletedAt: iso(m.deletedAt),
        revision: m.revision,
        referenceMessageId: m.referenceMessageId ?? null,
        isBot: m.isBot,
        isSystem: m.isSystem,
        mentions: m.mentions as TranscriptMessageView["mentions"],
        embeds: m.embeds as TranscriptMessageView["embeds"],
        components: m.components as TranscriptMessageView["components"],
        stickers: m.stickers as TranscriptMessageView["stickers"],
        reactions: m.reactions as TranscriptMessageView["reactions"],
        deletedBy: (m.deletedBy as TranscriptMessageView["deletedBy"]) ?? null,
        attachments: m.attachments as TranscriptMessageView["attachments"],
        incompleteFields: m.incompleteFields,
        editHistory: editsOf.get(m.messageId) ?? [],
    });
    const messages = rows.map((m) => view(m as TranscriptMessageDoc));
    const channelEvents = (ticket.channelEvents ?? []).map((c) => ({ type: c.type as "renamed" | "topic_changed", from: c.from ?? null, to: c.to ?? null, at: iso(c.at) ?? "" }));
    const participants = ticket.participants.map((p) => ({ userId: p.userId ?? "", role: (p.role ?? "added") as "owner" | "claimer" | "added" | "staff", addedAt: iso(p.addedAt), removedAt: iso(p.removedAt) }));

    return {
        format: TRANSCRIPT_FORMAT,
        transcriptId,
        generatedAt: new Date().toISOString(),
        locale: s.general.language,
        guild: { id: guild.id, name: guild.name, iconUrl: guild.iconURL() },
        ticket: {
            number: ticket.number,
            channelId,
            channelName: ticket.channelName,
            channelTopic: [...channelEvents].reverse().find((e) => e.type === "topic_changed")?.to ?? `${ticket.optionLabel} · #${String(ticket.number).padStart(4, "0")}`,
            panelName: ticket.panelName,
            optionLabel: ticket.optionLabel,
            openedAt: iso(ticket.openedAt),
            closedAt: iso(ticket.closedAt ?? new Date()),
            closedBy: ticket.closedBy ?? null,
            closeReason: ticket.closeReason ?? null,
            ownerId: ticket.ownerId,
            claimerId: ticket.claimerId ?? null,
            participants,
            answers: (ticket.answers ?? []).map((a) => ({ question: a.question ?? "", answer: a.answer ?? "" })),
        },
        users,
        messages,
        channelEvents,
        stats: {
            messageCount: messages.filter(counts).length,
            deletedCount: messages.filter((m) => m.deleted).length,
            editedCount: messages.filter((m) => m.revision > 0).length,
            attachmentCount: messages.reduce((n, m) => n + m.attachments.length, 0),
            imageCount: messages.reduce((n, m) => n + m.attachments.filter((a) => a.isImage).length, 0),
            renameCount: channelEvents.filter((c) => c.type === "renamed").length,
            participantCount: new Set(participants.map((p) => p.userId)).size,
        },
    };
}

/**
 * Saves the ticket's transcript (a new version each time; the same id for the same ticket) and, with `post`, sends it to
 * the transcript channel and the owner. Returns its id, link and the file to attach.
 */
/** A transcript message as the dashboard set it: text or a design, the HTML file if wanted, a link button if wanted. */
function transcriptMessage(m: TranscriptMessage, vars: Record<string, string>, url: string | null, file: { attachment: Buffer; name: string }) {
    const button: Row[] = m.button.show && url ? [{ type: 1, components: [{ type: 2, style: 5, url, ...(m.button.label.trim() ? { label: m.button.label.trim().slice(0, 80) } : {}), ...(m.button.emoji.trim() ? { emoji: { name: m.button.emoji.trim() } } : {}) }] }] : [];
    const files = m.attachFile ? [file] : [];
    if (m.style === "text") {
        const content = m.text.replace(/\{(\w+)\}/g, (x, k: string) => vars[k] ?? x).slice(0, 2000) || " ";
        return { content, components: button, files, allowedMentions: { parse: [] } };
    }
    const p = renderMessage(m.design, vars, button, { users: [], roles: [] });
    return { ...p, files: [...(p.files ?? []), ...files] };
}

export async function archiveTicket(guild: Guild, channelId: string, { post, forOwner = false }: { post: boolean; forOwner?: boolean }) {
    const ticket = await tickets.byChannel(channelId);
    if (!ticket) return null;
    // The owner asking after the first close: the copy they were sent, not what happened since.
    if (forOwner && ticket.transcriptSentAt && ticket.transcriptId) {
        const kept = (await transcripts.byPublicId(ticket.transcriptId))?.ownerDocument as TicketTranscriptDocument | null | undefined;
        if (kept) return { id: ticket.transcriptId, url: transcriptUrl(ticket.transcriptId), file: { attachment: Buffer.from(await transcriptHtml(kept), "utf8"), name: exportFilename(kept, "html") } };
    }
    const id = ticket.transcriptId ?? newTranscriptId();
    const doc = await buildDocument(guild, channelId, id);
    if (!doc) return null;
    // Discord's attachment links expire: keep the pictures in R2 and point the transcript there.
    await keepPictures(doc, guild.id);
    // The first close: the only time it's sent, and the version the owner keeps seeing.
    const first = post && !ticket.transcriptSentAt;
    const owner = doc.users[ticket.ownerId];
    const claimer = ticket.claimerId ? doc.users[ticket.claimerId] : null;
    await transcripts.save({
        publicId: id, guildId: guild.id, channelId, ticketNumber: ticket.number, channelName: ticket.channelName, panelName: ticket.panelName ?? '', optionLabel: ticket.optionLabel,
        ownerId: ticket.ownerId, ownerName: owner?.displayName ?? owner?.username ?? ticket.ownerId,
        claimerId: ticket.claimerId ?? null, claimerName: claimer ? claimer.displayName ?? claimer.username : null,
        participantIds: [...new Set(doc.ticket.participants.map((p) => p.userId))], messageCount: doc.stats.messageCount,
        openedAt: ticket.openedAt ?? null, closedAt: new Date(), document: doc, ...(first ? { ownerDocument: doc } : {}),
    });
    if (!ticket.transcriptId || first) await tickets.update(channelId, { transcriptId: id, ...(first ? { transcriptSentAt: new Date() } : {}) });

    const url = transcriptUrl(id);
    const html = await transcriptHtml(doc);
    const file = { attachment: Buffer.from(html, "utf8"), name: exportFilename(doc, "html") };

    if (first) {
        const s = await settings.get(guild.id);
        const vars = { number: String(ticket.number).padStart(4, "0"), channel: ticket.channelName, server: guild.name, link: url ?? "" };
        // The ticket's panel's transcript channel, else the server's.
        const panel = s.panels.find((p) => p.id === ticket.panelId);
        const option = panel?.options.find((o) => o.id === ticket.optionId);
        const target = panel && option ? resolvePlaces(s.general, panel, option).transcriptChannelId : s.general.transcriptChannelId;
        if (target) {
            const ch = guild.channels.cache.get(target) ?? (await guild.channels.fetch(target).catch(() => null));
            if (ch?.isSendable()) await ch.send(transcriptMessage(s.general.transcriptPost, vars, url, file) as never).catch((e) => Logger.warn(`[transcript] channel post: ${e}`));
        }
        if (s.general.transcriptToOwner) {
            const user = await guild.client.users.fetch(ticket.ownerId).catch(() => null);
            await user?.send(transcriptMessage(s.general.dmTranscript, vars, url, file) as never).catch(() => null);
        }
    }
    return { id, url, file };
}
