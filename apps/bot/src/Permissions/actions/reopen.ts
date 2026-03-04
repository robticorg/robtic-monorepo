import { Interaction, TextChannel } from "discord.js";
import { TicketService } from "@robo/db";
import { InteractionUtils } from "@/lib/interactionUtils";
import { messages } from "@/lib/messages";
import { Logger } from "@robo/logger";
import { channelProps } from "@robo/shared";
import { sendTicketLog } from "@/utils/ticketLogger";
import { TicketActionServices } from "@/Permissions/roles";

export const reopenTicket = async (
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

        if (found.status === "OPEN") {
            return InteractionUtils.safeReply(interaction, messages.warn.opened);
        }

        const channelData = (found.panel as any)?.channels as channelProps;
        const guild = interaction.guild;
        if (!guild) return;

        const channel = guild.channels.cache.get(channelId);
        if (!channel || !(channel instanceof TextChannel)) {
             await InteractionUtils.safeReply(interaction, messages.error.ticketNotFound);
             return;
        }

        // Restore permission for the ticket owner
        const ticketOwnerId = found.userId;
        if (ticketOwnerId) {
            await channel.permissionOverwrites.edit(ticketOwnerId, {
                ViewChannel: true,
                SendMessages: true,
            });
        }
        
        await InteractionUtils.safeReply(interaction, messages.success.opened);
        Logger.success(`Ticket reopened: ${channelId} by ${interaction.user.id}`);

        await sendTicketLog(
            guild,
            channelData?.logs?.reOpen,
            `🔓 Ticket reopened by ${interaction.user.tag} — <#${channelId}>`
        );

        await services.db.update(found.id, { status: "OPEN" });

        if (channel.isSendable()) {
            await channel.send("🔓 This ticket has been reopened.");
        }

    } catch (err) {
        Logger.error("[Ticket.reopen]", err);
        await InteractionUtils.safeReply(interaction, messages.error.main);
    }
};
