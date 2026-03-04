import { Interaction, TextChannel } from "discord.js";
import { TicketService } from "@robo/db";
import { InteractionUtils } from "@/lib/interactionUtils";
import { messages } from "@/lib/messages";
import { Logger } from "@robo/logger";
import { channelProps } from "@robo/shared";
import { sendTicketLog } from "@/utils/ticketLogger";
import { TicketActionServices } from "@/Permissions/roles";

export const deleteTicket = async (
    interaction: Interaction,
    channelId: string | undefined,
    services: TicketActionServices
) => {
    try {
        if (!channelId) {
            return InteractionUtils.safeReply(interaction, messages.error.ticketNotFound);
        }

        const found = await services.db.find("channel", channelId);
        if (!found) {
             await InteractionUtils.safeReply(interaction, messages.warn.noOpenTicket);
             return;
        }

        const channelData = (found.panel as any)?.channels as channelProps;
        const guild = interaction.guild;
        if (!guild) return;

        const channel = guild.channels.cache.get(channelId);
        if (!channel) {
             await InteractionUtils.safeReply(interaction, messages.error.ticketNotFound);
             return;
        }

        const channelName = channel.name;
        // The deletion happens here
        await channel.delete("Ticket deleted");
        
        Logger.success(`Ticket deleted: ${channelId} (${channelName})`);

        await sendTicketLog(
            guild,
            channelData?.logs?.delete,
            `🗑️ Ticket \`${channelName}\` deleted by ${interaction.user.tag}`
        );

        await services.db.delete(found.id);

    } catch (err) {
        Logger.error("[Ticket.delete]", err);
        await InteractionUtils.safeReply(interaction, messages.error.failedDeleteTicket);
    }
};
