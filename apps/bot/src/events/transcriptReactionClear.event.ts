import { Events, type Message, type PartialMessage } from "discord.js";
import { captureReactionsCleared } from "@/ticket/transcript/capture";

/** Transcripts: all reactions removed from a message in a ticket. */
export default {
    name: Events.MessageReactionRemoveAll,
    run: async (message: Message | PartialMessage) => {
        await captureReactionsCleared(message.channelId, message.id);
    },
};
