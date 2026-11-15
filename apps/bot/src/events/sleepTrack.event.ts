import { Events, type Message } from "discord.js";
import { TicketRepository } from "@robo/db";

// Sleep: every message a person sends in a ticket either clears the wait (the owner wrote) or starts it (someone else
// wrote last). Two small updates matched by channel and owner; channels that aren't tickets match nothing.

const tickets = new TicketRepository();

export default {
    name: Events.MessageCreate,
    run: async (message: Message) => {
        if (!message.inGuild() || message.author.bot || message.system) return;
        await tickets.noteMessage(message.channelId, message.author.id);
    },
};
