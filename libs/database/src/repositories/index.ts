import { normalizeTicketSettings, type TicketPanel, type TicketSettings } from '@robo/shared';
import { Logger } from '@robo/logger';
import {
    CounterModel, PanelPostModel, TicketModel, TicketSettingsModel, TranscriptEditModel, TranscriptMessageModel, TranscriptModel, type TicketDoc,
    type TranscriptMessageDoc,
} from '../models';

// What the bot reads and writes, one repository per thing. Errors are logged here; callers get null or an empty list
// rather than an exception in the middle of a Discord interaction.

/* ------------------------------------------------------------------ settings (written by the dashboard) */

const CACHE_MS = 5_000;
const cache = new Map<string, { at: number; value: TicketSettings }>();

export class SettingsRepository {
    /** A server's settings, cached for a few seconds (the dashboard's saves show up almost at once). */
    async get(guildId: string): Promise<TicketSettings> {
        const hit = cache.get(guildId);
        if (hit && Date.now() - hit.at < CACHE_MS) return hit.value;
        const row = await TicketSettingsModel.findOne({ guildId }).lean().catch((e) => { Logger.error(`settings ${guildId}: ${e}`); return null; });
        const value: TicketSettings = normalizeTicketSettings(row);
        cache.set(guildId, { at: Date.now(), value });
        return value;
    }

    forget(guildId: string) {
        cache.delete(guildId);
    }

    /** Where a panel was posted, written back so the dashboard shows it and "Update" edits it in place. */
    async setPosted(guildId: string, panelId: string, posted: TicketPanel['posted']) {
        await TicketSettingsModel.updateOne({ guildId, 'panels.id': panelId }, { $set: { 'panels.$.posted': posted } });
        this.forget(guildId);
    }

    /** The next ticket number: the counter, or the dashboard's "next number" when that's higher. */
    async nextNumber(guildId: string): Promise<number> {
        const from = (await this.get(guildId)).general.nextNumber;
        const row = await CounterModel.findOneAndUpdate({ guildId }, { $inc: { next: 1 } }, { upsert: true, new: true }).lean();
        const taken = (row?.next ?? 2) - 1;
        if (taken >= from) return taken;
        await CounterModel.updateOne({ guildId }, { $set: { next: from + 1 } });
        return from;
    }
}

/* ------------------------------------------------------------------ panel posts (requested by the dashboard) */

export class PanelPostRepository {
    pending() {
        return PanelPostModel.find({ doneAt: null }).sort({ requestedAt: 1 }).limit(20).lean();
    }

    async done(guildId: string, panelId: string, error: string | null = null) {
        await PanelPostModel.updateOne({ guildId, panelId }, { $set: { doneAt: new Date(), error } });
    }
}

/* ------------------------------------------------------------------ tickets */

export class TicketRepository {
    create(data: Pick<TicketDoc, 'guildId' | 'channelId' | 'channelName' | 'number' | 'panelId' | 'panelName' | 'optionId' | 'optionLabel' | 'ownerId'> & { answers: { question: string; answer: string }[] }) {
        return TicketModel.create({ ...data, participants: [{ userId: data.ownerId, role: 'owner', addedAt: new Date() }] });
    }

    byChannel(channelId: string) {
        return TicketModel.findOne({ channelId }).lean<TicketDoc>().catch(() => null);
    }

    /** The member's open tickets from one option (for the per-member limit). */
    openOf(guildId: string, ownerId: string, optionId: string) {
        return TicketModel.find({ guildId, ownerId, optionId, status: 'open' }).lean<TicketDoc[]>();
    }

    async update(channelId: string, set: Record<string, unknown>, extra: Record<string, unknown> = {}) {
        return TicketModel.findOneAndUpdate({ channelId }, { $set: set, ...extra }, { new: true }).lean<TicketDoc>();
    }

    async addParticipant(channelId: string, userId: string, role: 'claimer' | 'added' | 'staff') {
        await TicketModel.updateOne({ channelId, 'participants.userId': { $ne: userId } }, { $push: { participants: { userId, role, addedAt: new Date() } } });
    }

    async channelEvent(channelId: string, type: 'renamed' | 'topic_changed', from: string | null, to: string | null) {
        await TicketModel.updateOne({ channelId }, { $push: { channelEvents: { type, from, to, at: new Date() } }, ...(type === 'renamed' && to ? { $set: { channelName: to } } : {}) });
    }

    /** The channel is gone: the ticket stays (for its transcript), marked closed. */
    async channelGone(channelId: string) {
        await TicketModel.updateOne({ channelId, status: 'open' }, { $set: { status: 'closed', closedAt: new Date(), closeReason: 'channel deleted' } });
    }

    isTicket(channelId: string) {
        return TicketModel.exists({ channelId }).then((x) => !!x).catch(() => false);
    }
}

/* ------------------------------------------------------------------ transcripts */

export class TranscriptRepository {
    async upsertMessage(messageId: string, data: Record<string, unknown>, bumpRevision = false) {
        await TranscriptMessageModel.updateOne({ messageId }, { $set: data, ...(bumpRevision ? { $inc: { revision: 1 } } : {}) }, { upsert: true });
    }

    async markDeleted(messageId: string, channelId: string, guildId: string, deletedBy: unknown) {
        await TranscriptMessageModel.updateOne({ messageId }, { $set: { deleted: true, deletedAt: new Date(), deletedBy }, $setOnInsert: { channelId, guildId, incompleteFields: ['content', 'author'] } }, { upsert: true });
    }

    async edit(channelId: string, messageId: string, before: string | null, after: string | null) {
        await TranscriptEditModel.create({ channelId, messageId, before, after });
    }

    async react(messageId: string, emoji: { id: string | null; name: string; animated: boolean }, userId: string, add: boolean) {
        const doc = await TranscriptMessageModel.findOne({ messageId }, { reactions: 1 }).lean();
        if (!doc) return;
        const list = ((doc.reactions as { emoji: typeof emoji; userIds: string[] }[]) ?? []).map((r) => ({ ...r, userIds: [...r.userIds] }));
        const key = emoji.id ?? emoji.name;
        let r = list.find((x) => (x.emoji.id ?? x.emoji.name) === key);
        if (!r && add) list.push((r = { emoji, userIds: [] }));
        if (r) r.userIds = add ? [...new Set([...r.userIds, userId])] : r.userIds.filter((u) => u !== userId);
        await TranscriptMessageModel.updateOne({ messageId }, { $set: { reactions: list.filter((x) => x.userIds.length) } });
    }

    async clearReactions(messageId: string) {
        await TranscriptMessageModel.updateOne({ messageId }, { $set: { reactions: [] } });
    }

    authorOf(messageId: string) {
        return TranscriptMessageModel.findOne({ messageId }, { author: 1 }).lean().then((d) => (d?.author as { id?: string } | null)?.id ?? null).catch(() => null);
    }

    messages(channelId: string) {
        return TranscriptMessageModel.find({ channelId }).sort({ messageCreatedAt: 1, _id: 1 }).lean();
    }

    edits(channelId: string) {
        return TranscriptEditModel.find({ channelId }).sort({ at: 1 }).lean();
    }

    save(data: { publicId: string; guildId: string; channelId: string; ticketNumber: number; channelName: string; panelName: string; optionLabel: string; ownerId: string; ownerName: string; claimerId: string | null; claimerName: string | null; participantIds: string[]; messageCount: number; openedAt: Date | null; closedAt: Date; document: unknown }) {
        return TranscriptModel.findOneAndUpdate({ publicId: data.publicId }, { $set: data }, { upsert: true, new: true }).lean();
    }

    byPublicId(publicId: string) {
        return TranscriptModel.findOne({ publicId }).lean();
    }
}
