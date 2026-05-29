import { Events, Interaction, PermissionsBitField, TextChannel, GuildMember } from "discord.js";
import { TicketRepository, PermissionService } from "@robo/db";
import { InteractionUtils } from "@/lib/interactionUtils";
import { Logger } from "@robo/logger";
import { TicketRoles, Buttons, ButtonType } from "@/Permissions";

const dbService = new TicketRepository();
const permService = new PermissionService();

async function hasPermission(
    member: GuildMember,
    channel: TextChannel,
    action: ButtonType,
    fallbackPerms?: readonly bigint[],
): Promise<boolean> {
    const dbPerm = await permService.findByAction(channel.guildId, action);
    Logger.info(`${action}`)

    if (dbPerm) {
        if (dbPerm.roleIds.length > 0) {
            const hasRole = dbPerm.roleIds.some((id) => member.roles.cache.has(id));
            Logger.info(`first check : ${hasRole}`)
            Logger.info(`second check ${dbPerm.roleIds}`)
            Logger.info(`last check : ${action}`)
            if (hasRole) return true;
        }

        if (dbPerm.permissions.length > 0) {
            const flags = dbPerm.permissions
                .map((name) => PermissionsBitField.Flags[name as keyof typeof PermissionsBitField.Flags])
                .filter(Boolean);

            if (flags.length > 0) {
                return flags.every((flag) => member.permissionsIn(channel).has(flag));
            }
        }

        return true;
    }

    if (fallbackPerms && fallbackPerms.length > 0) {
        return fallbackPerms.every((perm) => member.permissionsIn(channel).has(perm));
    }

    return true;
}

export default {
    name: Events.InteractionCreate,

    run: async (interaction: Interaction) => {
        if (!interaction.isButton()) return;

        const buttonConfig = Buttons[interaction.customId as ButtonType];
        if (!buttonConfig) return;

        const action = TicketRoles[interaction.customId as ButtonType];
        if (!action) return;

        if (interaction.channel instanceof TextChannel) {
            const member = interaction.guild?.members.cache.get(interaction.user.id);
            if (!member) return;

            const allowed = await hasPermission(
                member,
                interaction.channel,
                buttonConfig.id,
                buttonConfig.permission,
            );

            if (!allowed) {
                await InteractionUtils.safeReply(
                    interaction,
                    "❌ You do not have permission to perform this action.",
                );
                return;
            }
        }

        const channelId = interaction.channel?.id;

        try {
            await action(interaction, channelId, {
                db: dbService,
            });
        } catch (err) {
            Logger.error("[ticketButtons]", err);
            await InteractionUtils.safeReply(
                interaction,
                "❌ Failed to process this action. Please try again.",
            );
        }
    },
};
