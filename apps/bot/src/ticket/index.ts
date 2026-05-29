import { TicketRepository } from "@robo/db";
import { TicketStateMachine } from "./TicketState";
import { TicketAuditService } from "./TicketAuditService";
import { Interaction } from "discord.js";
import { channelProps, TicketProps } from "@robo/shared";
import { InteractionUtils } from "@/lib/interactionUtils";
import { messages } from "@/lib/messages";
import { TicketChannelConfig } from "./types";
import { TicketDiscordAdapter } from "./TicketDiscordAdapter";
import { addSupportRoles, createBasePermissions } from "./TicketPermission";
import { Logger } from "@robo/logger";
import { Created } from "./TicketEmbed";
import { row } from "@/Permissions/buttons";

export class TicketServices {
    constructor(
        private repo: TicketRepository,
        private state: TicketStateMachine,
        private audit: TicketAuditService,
        private discord: TicketDiscordAdapter
    ) { }

    async create(interaction: Interaction, data: TicketProps) {
        if (!data) return InteractionUtils.safeReply(interaction, messages.error.ticketData);

        try {
            const channelData = (data.channels as channelProps | null) ?? null;

            const config: TicketChannelConfig = {
                name: data.name || "ticket",
                category: channelData?.category ?? null,
                supportRoleIds: [],
                logChannels: channelData?.logs,
            };

            const guild = interaction.guild;
            if (!guild) return;

            const permission = createBasePermissions(guild, interaction);
            addSupportRoles(permission, config.supportRoleIds!)

            const channel = await this.discord.createChannel(config, interaction, permission);

            if (!channel) return;
            await this.repo.create(channel.id, interaction.user.id, data.id);

            await InteractionUtils.safeReply(
                interaction,
                `✅ Ticket created successfully in ${channel}`
            );

            Logger.success(`Ticket channel created: ${channel.id} by ${interaction.user.id}`);
            Logger.debug(messages.debug.created);

            this.audit.logCreate(guild, config.logChannels?.open, interaction);
            await channel.send({
                content: `${interaction.user} welcome`,
                embeds: [Created()],
                components: [row(["close", "manage"])],
            });
        } catch (err) {
            Logger.error("[TicketService.create]", err);

            await InteractionUtils.safeReply(
                interaction,
                "❌ Failed to create ticket."
            );
        }
    }
}

export { TicketRepository, TicketStateMachine, TicketAuditService, TicketDiscordAdapter };
