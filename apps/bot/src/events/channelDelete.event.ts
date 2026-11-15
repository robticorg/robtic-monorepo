import { Events, type Channel } from "discord.js";
import { TicketRepository } from "@robo/db";
import { forgetChannel } from "@/ticket/transcript/capture";

const tickets = new TicketRepository();

/** A ticket channel deleted by hand: the ticket is kept (with its transcript) and marked closed. */
export default {
    name: Events.ChannelDelete,
    run: async (channel: Channel) => {
        if (channel.isDMBased()) return;
        forgetChannel(channel.id);
        await tickets.channelGone(channel.id).catch(() => null);
    },
};
