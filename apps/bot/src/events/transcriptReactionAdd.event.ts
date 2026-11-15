import { Events, type MessageReaction, type PartialMessageReaction, type PartialUser, type User } from "discord.js";
import { captureReaction } from "@/ticket/transcript/capture";

/** Transcripts: a reaction added in a ticket. */
export default {
    name: Events.MessageReactionAdd,
    run: async (reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) => {
        const e = reaction.emoji;
        await captureReaction(reaction.message.channelId, reaction.message.id, { id: e.id ?? null, name: e.name ?? "❔", animated: e.animated === true }, user.id, true);
    },
};
