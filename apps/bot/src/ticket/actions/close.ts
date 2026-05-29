import { Interaction, TextChannel } from "discord.js";
import { InteractionUtils } from "@/lib/interactionUtils";
import { messages } from "@/lib/messages";
import { Logger } from "@robo/logger";
import { channelProps } from "@robo/shared";
import { row } from "@/Permissions/buttons";
import { TicketActionServices } from "@/Permissions/roles";
import { JsonValue } from "@/types";

export const closeTicket = async (
    interaction: Interaction,
    channelId: string | undefined,
    services: TicketActionServices
) => {
    try {
        const guild = interaction.guild;

        if (!channelId) {
            return InteractionUtils.safeReply(interaction, messages.error.ticketNotFound);
        }

        if (!guild) return;

        const channel = guild.channels.cache.get(channelId);
        const found = await services.db.find("channel", channelId);

        if (!found || found.status === "CLOSED") {
            found?.status === "CLOSED" ? 
                await InteractionUtils.safeReply(interaction, messages.warn.closedTicket) :
                await InteractionUtils.safeReply(interaction, messages.warn.noOpenTicket);
            return;
        }

        const channelData : channelProps | JsonValue = found.panel?.channels ?? null;

        if (!channel || !(channel instanceof TextChannel)) return await InteractionUtils.safeReply(interaction, messages.error.ticketNotFound);

        // await InteractionUtils.safeReply(interaction, messages.success.closed);
        // Logger.success(`Ticket closed: ${channelId} by ${interaction.user.id}`);

        // await sendTicketLog(
        //     guild,
        //     channelData?.logs.close,
        //     `🔒 Ticket closed by ${interaction.user.tag} — <#${channelId}>`
        // );

        await channel.permissionOverwrites.edit(interaction.user.id, {
            ViewChannel: false,
            SendMessages: false,
        });

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
