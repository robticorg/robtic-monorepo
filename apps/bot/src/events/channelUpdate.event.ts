import { Events, type DMChannel, type GuildChannel } from "discord.js";
import { TicketRepository } from "@robo/db";
import { isTicketChannel } from "@/ticket/transcript/capture";

const tickets = new TicketRepository();

/** Transcripts: a ticket renamed or its topic changed (by Rename or by hand) goes into its history. */
export default {
    name: Events.ChannelUpdate,
    run: async (before: DMChannel | GuildChannel, after: DMChannel | GuildChannel) => {
        if (before.isDMBased() || after.isDMBased() || !(await isTicketChannel(after.id))) return;
        if (before.name !== after.name) await tickets.channelEvent(after.id, "renamed", before.name, after.name);
        const topicOf = (c: GuildChannel) => ("topic" in c ? ((c as { topic: string | null }).topic ?? null) : null);
        if (topicOf(before) !== topicOf(after)) await tickets.channelEvent(after.id, "topic_changed", topicOf(before), topicOf(after));
    },
};
