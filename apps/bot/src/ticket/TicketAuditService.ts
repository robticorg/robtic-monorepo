import { Logger } from "@robo/logger";
import { Guild, Interaction } from "discord.js";

export class TicketAuditService {
    private async sendLog(
        guild: Guild,
        channelId: string | undefined,
        message: string
    ) {
        if (!channelId) return;

        try {
            const channel = guild.channels.cache.get(channelId);
            if (channel && channel.isSendable()) {
                await channel.send(message);
            }
        } catch (err: any) {
            Logger.error("[TicketLog]", "Failed to send log message", err);
        }
    }

    logClose(guild: Guild, id: string | undefined) {
        this.sendLog(guild, id, "");
    }

    logCreate(guild: Guild, id: string | undefined, interaction: Interaction) {
        this.sendLog(guild, id, `📩 Ticket opened by ${interaction.user.tag}`);
    }

    logClaim(guild: Guild, id: string | undefined, interaction: Interaction, channelId: string) {
        this.sendLog(
            guild,
            id,
            `📝 Ticket <#${channelId}> claimed by ${interaction.user.tag}`)
    }
}