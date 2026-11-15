import { Events, type Client } from "discord.js";
import { Logger } from "@robo/logger";
import { startPanelPoster } from "@/ticket/PanelPoster";
import { isGuildBlocked, onBlockedChange } from "@robo/config/remote";

/** Logged in: start posting the panels the dashboard asks for. */
export default {
    name: Events.ClientReady,
    once: true,
    run: (client: Client<true>) => {
        Logger.success(`Robtic Ticket is online as ${client.user.tag} in ${client.guilds.cache.size} server(s)`);
        startPanelPoster(client);
        // Servers blocked in the admin console (Discord → Blocked servers): leave now, and whenever the list grows.
        const leaveBlocked = () => { for (const g of client.guilds.cache.values()) if (isGuildBlocked(g.id)) void g.leave().then(() => Logger.warn(`Left blocked server ${g.id}`)).catch(() => null); };
        leaveBlocked();
        onBlockedChange(leaveBlocked);
    },
};
