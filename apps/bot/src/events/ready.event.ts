import { Events, type Client } from "discord.js";
import { Logger } from "@robo/logger";
import { startPanelPoster } from "@/ticket/PanelPoster";

/** Logged in: start posting the panels the dashboard asks for. */
export default {
    name: Events.ClientReady,
    once: true,
    run: (client: Client<true>) => {
        Logger.success(`Robtic Ticket is online as ${client.user.tag} in ${client.guilds.cache.size} server(s)`);
        startPanelPoster(client);
    },
};
