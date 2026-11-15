import { Events, type Message } from "discord.js";
import { captureCreated } from "@/ticket/transcript/capture";
import type { MessageLike } from "@/ticket/transcript/mapper";

/** Transcripts: every message sent in a ticket (the bot's own included: its cards are part of the story). */
export default {
    name: Events.MessageCreate,
    run: async (message: Message) => {
        if (!message.inGuild()) return;
        await captureCreated(message as unknown as MessageLike);
    },
};
