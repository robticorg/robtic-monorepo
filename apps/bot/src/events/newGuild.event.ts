import { Events, type Guild } from "discord.js";
import { Logger } from "@robo/logger";
import { isGuildAllowed } from "@robo/config/remote";

/** Added to a server: leave it if it isn't allowed; otherwise nothing to set up here (everything is on the dashboard). */
export default {
    name: Events.GuildCreate,
    run: async (guild: Guild) => {
        if (isGuildAllowed(guild.id) === false) {
            Logger.warn(`Added to server ${guild.id} it may not be in: leaving`);
            await guild.leave().catch(() => null);
            return;
        }
        Logger.info(`Joined ${guild.name} (${guild.id})`);
    },
};
