import { Interaction, TextChannel } from "discord.js";
import { TicketService } from "@robo/db";
import { InteractionUtils } from "@/lib/interactionUtils";
import { messages } from "@/lib/messages";
import { Logger } from "@robo/logger";
import { channelProps } from "@robo/shared";
import { sendTicketLog } from "@/utils/ticketLogger";
import { TicketActionServices } from "@/Permissions/roles";

export const claimTicket = async (
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

        if (found.claimer) {
            return InteractionUtils.safeReply(
                interaction,
                `This ticket is already claimed by <@${found.claimer}>.`,
            );
        }

        const channelData = (found.panel as any)?.channels as channelProps;
        const guild = interaction.guild;
        if (!guild) return;

        const channel = guild.channels.cache.get(channelId);
        if (!channel || !(channel instanceof TextChannel)) {
             return;
        }

        if (channel.isSendable()) {
            await channel.send(`📝 This ticket has been claimed by ${interaction.user}.`);
        }

        Logger.success(`Ticket ${channelId} claimed by ${interaction.user.id}`);

        await sendTicketLog(
            guild,
            channelData?.logs?.claim,
            `📝 Ticket <#${channelId}> claimed by ${interaction.user.tag}`
        );

        await services.db.update(found.id, { claimer: interaction.user.id });
        await InteractionUtils.safeReply(interaction, "📝 You have claimed this ticket.");

    } catch (err) {
        Logger.error("[Ticket.claim]", err);
        await InteractionUtils.safeReply(interaction, messages.error.main);
    }
};
