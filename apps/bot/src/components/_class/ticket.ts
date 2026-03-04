import { InteractionUtils } from "@/lib/interactionUtils";
import { ChannelType, Interaction, OverwriteResolvable, PermissionsBitField } from "discord.js";
import { Logger } from "@robo/logger";
import { TicketProps, channelProps, LogsChannelProps } from "@robo/shared";
import { TicketService } from "@robo/db";
import { messages } from "@/lib/messages";
import { row } from "@/Permissions/buttons";
import { Created } from "@/components/_embeds/TicketEmbed";
import { sendTicketLog } from "@/utils/ticketLogger";

interface TicketChannelConfig {
    name: string;
    category: string | null;
    supportRoleIds?: string[];
    logChannels?: LogsChannelProps;
}

/**
 * High-level ticket orchestrator.
 * 
 * Coordinates between the low-level Discord channel service (`TicketUtils`)
 * and the database persistence layer (`TicketService`).
 * 
 * Dependencies are injected via the constructor so the class can be
 * extended or tested with mocks without changing call-sites.
 */
export class Ticket {

    constructor(private dbService: TicketService) {
        this.dbService = dbService;
    }

    // ── Helpers ───────────────────────────────────────

    /**
     * Extracts the channel config stored in the ticket-panel `channels` JSON.
     */
    private extractChannelData(panel: { channels?: unknown } | null): channelProps | null {
        return (panel?.channels as channelProps) ?? null;
    }

    // ── Public API ───────────────────────────────────

    /**
     * Creates a new ticket (Discord channel + DB row).
     */
    async create(interaction: Interaction, data?: TicketProps) {
        try {
            if (!data) {
                return InteractionUtils.safeReply(interaction, messages.error.ticketData);
            }

            const channelData = this.extractChannelData(data);

            const config: TicketChannelConfig = {
                name: data.name || "ticket",
                category: channelData?.category ?? null,
                supportRoleIds: [], // extend from guild-config / panel `data` later
                logChannels: channelData?.logs,
            };

            // Inline TicketUtils.create logic
            const guild = interaction.guild;
            if (!guild) {
                await InteractionUtils.safeReply(interaction, messages.error.main);
                return;
            }

            const permissionOverwrites: OverwriteResolvable[] = [
                {
                    id: guild.roles.everyone,
                    deny: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: interaction.user.id,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.AttachFiles,
                        PermissionsBitField.Flags.EmbedLinks,
                    ],
                },
            ];

            if (config.supportRoleIds?.length) {
                for (const roleId of config.supportRoleIds) {
                    permissionOverwrites.push({
                        id: roleId,
                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.SendMessages,
                        ],
                    });
                }
            }

            const channel = await guild.channels.create({
                parent: config.category,
                name: `${config.name}-${interaction.user.username}`,
                type: ChannelType.GuildText,
                permissionOverwrites,
            });

            await InteractionUtils.safeReply(
                interaction,
                `✅ Ticket created successfully in ${channel}`
            );

            await channel.send({
                content: `${interaction.user} welcome`,
                embeds: [Created()],
                components: [row(["close", "manage"])],
            });

            Logger.success(`Ticket channel created: ${channel.id} by ${interaction.user.id}`);

            await sendTicketLog(
                guild,
                config.logChannels?.open,
                `📩 Ticket opened by ${interaction.user.tag} — ${channel}`
            );

            const result = { channelId: channel.id, success: true };

            if (!result) return;

            await this.dbService.create(result.channelId, interaction.user.id, data.id!);

            Logger.debug(messages.debug.created);
        } catch (err) {
            Logger.error("[Ticket.create]", err);
            await InteractionUtils.safeReply(interaction, messages.error.failedCreateTicket);
        }
    }
}