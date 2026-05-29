import { Events, Guild } from "discord.js";
import { GuildService, PermissionService, DefaultPermissions } from "@robo/db";
import { Logger } from "@robo/logger";

export default {
    name: Events.GuildCreate,
    run: async (guild: Guild) => {
        const guildService = new GuildService();
        const permService = new PermissionService();

        Logger.info(`📥 Joined guild: ${guild.name} (${guild.id})`);

        await guildService.ensureGuild(guild.id);
        await permService.seedDefaults(guild.id, DefaultPermissions);
    },
};