import { Events, type Message, type PartialMessage } from "discord.js";
import { captureUpdated } from "@/ticket/transcript/capture";
import type { MessageLike } from "@/ticket/transcript/mapper";

/** Transcripts: an edit in a ticket (what it said before is kept). An uncached message is fetched first. */
export default {
    name: Events.MessageUpdate,
    run: async (before: Message | PartialMessage, after: Message | PartialMessage) => {
        if (!after.guildId) return;
        const current = after.partial ? await after.fetch().catch(() => after) : after;
        await captureUpdated(before as unknown as MessageLike, current as unknown as MessageLike);
    },
};
