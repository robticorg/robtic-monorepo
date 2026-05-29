import { Events, Channel } from "discord.js";
import { TicketRepository } from "@robo/db";

export default {
    name: Events.ChannelDelete,
    run: async (channel: Channel) => {
        const ticket = new TicketRepository();

        if (!channel.isTextBased()) return;

        await ticket.delete(channel.id); 
    }
}
