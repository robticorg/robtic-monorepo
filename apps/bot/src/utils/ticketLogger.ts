import { Guild } from "discord.js";
import { Logger } from "@robo/logger";

export const sendTicketLog = async (
    guild: Guild,
    channelId: string | undefined,
    message: string
) => {
    if (!channelId) return;

    try {
        const channel = guild.channels.cache.get(channelId);
        if (channel && channel.isSendable()) {
            await channel.send(message);
        }
    } catch (err : any) {
        Logger.error("[TicketLog]", "Failed to send log message", err);
    }
};
