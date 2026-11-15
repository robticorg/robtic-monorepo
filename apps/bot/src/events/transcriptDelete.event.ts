import { Events, type Message, type PartialMessage } from "discord.js";
import { captureDeleted } from "@/ticket/transcript/capture";
import type { MessageLike } from "@/ticket/transcript/mapper";

/** Transcripts: a deleted message stays in the transcript, marked deleted, with who deleted it. */
export default {
    name: Events.MessageDelete,
    run: async (message: Message | PartialMessage) => {
        if (!message.guildId) return;
        await captureDeleted(message as unknown as MessageLike, message.guild ?? null);
    },
};
