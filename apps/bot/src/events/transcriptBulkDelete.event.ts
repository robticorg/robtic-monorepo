import { Events, type Collection, type GuildTextBasedChannel, type Message, type PartialMessage } from "discord.js";
import { captureBulkDeleted } from "@/ticket/transcript/capture";
import type { MessageLike } from "@/ticket/transcript/mapper";

/** Transcripts: a purge in a ticket; every message is kept, marked deleted by whoever purged. */
export default {
    name: Events.MessageBulkDelete,
    run: async (messages: Collection<string, Message | PartialMessage>, channel: GuildTextBasedChannel) => {
        await captureBulkDeleted([...messages.values()] as unknown as MessageLike[], channel.guild, channel.id);
    },
};
