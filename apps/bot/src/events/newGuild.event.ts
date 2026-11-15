import { Events, type Guild } from "discord.js";
import { Logger } from "@robo/logger";

/** Added to a server: nothing to set up here, everything is designed on the dashboard (Robtic Ticket). */
export default {
    name: Events.GuildCreate,
    run: async (guild: Guild) => {
        Logger.info(`Joined ${guild.name} (${guild.id})`);
    },
};
