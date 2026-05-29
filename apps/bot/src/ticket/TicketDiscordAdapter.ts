import { ChannelType, Interaction, OverwriteResolvable } from "discord.js";
import { TicketChannelConfig } from "./types";

export class TicketDiscordAdapter {

    async createChannel(config: TicketChannelConfig, interaction: Interaction, permissions: OverwriteResolvable[]) {
        const guild = interaction.guild;
        if(!guild) return;

        try {
            return await guild.channels.create({
                parent: config.category,
                name: `${config.name}-${interaction.user.username}`,
                type: ChannelType.GuildText,
                permissionOverwrites: permissions
            });
        } catch (createError) {
            return null;
        }
    }

}