import { Events, type Client } from "discord.js";
import { Logger } from "@robo/logger";
import { startPanelPoster } from "@/ticket/PanelPoster";
import { isGuildAllowed, onAccessChange, onBlockedChange } from "@robo/config/remote";

/** Logged in: start posting the panels the dashboard asks for. */
export default {
    name: Events.ClientReady,
    once: true,
    run: (client: Client<true>) => {
        Logger.success(`Robtic Ticket is online as ${client.user.tag} in ${client.guilds.cache.size} server(s)`);
        startPanelPoster(client);
        // Servers it may not be in (blocked in the admin console, or not on the shared allowlist unless the bot is open
        // to everyone): leave now, and whenever either list changes.
        const leaveNotAllowed = () => {
            for (const g of client.guilds.cache.values()) {
                if (isGuildAllowed(g.id) === false) void g.leave().then(() => Logger.warn(`Left server ${g.id}: not allowed`)).catch(() => null);
            }
        };
        leaveNotAllowed();
        onBlockedChange(leaveNotAllowed);
        onAccessChange(leaveNotAllowed);
    },
};
