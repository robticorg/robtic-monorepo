import { Events, type Guild } from "discord.js";
import { Logger } from "@robo/logger";
import { isGuildBlocked } from "@robo/config/remote";

/** Added to a server: nothing to set up here, everything is designed on the dashboard (Robtic Ticket). */
export default {
    name: Events.GuildCreate,
    run: async (guild: Guild) => {
        if (isGuildBlocked(guild.id)) {
            Logger.warn(`Added to blocked server ${guild.id}: leaving`);
            await guild.leave().catch(() => null);
            return;
        }
        Logger.info(`Joined ${guild.name} (${guild.id})`);
    },
};
