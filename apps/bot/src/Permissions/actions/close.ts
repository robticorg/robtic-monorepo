import { Interaction, TextChannel } from "discord.js";
import { TicketService } from "@robo/db";
import { InteractionUtils } from "@/lib/interactionUtils";
import { messages } from "@/lib/messages";
import { Logger } from "@robo/logger";
import { channelProps } from "@robo/shared";
import { row } from "@/Permissions/buttons";
import { sendTicketLog } from "@/utils/ticketLogger";
import { TicketActionServices } from "@/Permissions/roles";

export const closeTicket = async (
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

        if (found.status === "CLOSED") {
            return InteractionUtils.safeReply(interaction, messages.warn.closedTicket);
        }

        const channelData = (found.panel as any)?.channels as channelProps;
        const guild = interaction.guild;
        
        if (!guild) return;

        const channel = guild.channels.cache.get(channelId);
        if (!channel || !(channel instanceof TextChannel)) {
             await InteractionUtils.safeReply(interaction, messages.error.ticketNotFound);
             return;
        }

        await channel.permissionOverwrites.edit(interaction.user.id, {
            ViewChannel: false,
            SendMessages: false,
        });

        await InteractionUtils.safeReply(interaction, messages.success.closed);
        Logger.success(`Ticket closed: ${channelId} by ${interaction.user.id}`);

        await sendTicketLog(
            guild,
            channelData?.logs?.close,
            `🔒 Ticket closed by ${interaction.user.tag} — <#${channelId}>`
        );

        await services.db.update(found.id, { status: "CLOSED" });

        if (channel.isSendable()) {
            await channel.send({
                content: "🔒 This ticket has been closed.",
                components: [row(["reopen", "delete", "transcript"])],
            });
        }

    } catch (err) {
        Logger.error("[Ticket.close]", err);
        await InteractionUtils.safeReply(interaction, messages.error.failedCloseTicket);
    }
};
