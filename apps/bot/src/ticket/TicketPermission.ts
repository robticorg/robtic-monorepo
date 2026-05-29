import { Guild, Interaction, OverwriteResolvable, PermissionsBitField } from "discord.js";

function createBasePermissions(guild: Guild, interaction: Interaction): OverwriteResolvable[] {
    return [
        {
            id: guild.roles.everyone,
            deny: [PermissionsBitField.Flags.ViewChannel],
            allow: [],
        },
        {
            id: interaction.user.id,
            deny: [],
            allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.AttachFiles,
                PermissionsBitField.Flags.EmbedLinks,
            ],
        },
    ];
}


function addSupportRoles(
    permissions: OverwriteResolvable[],
    roleIds: string[]
): void {
    for (const roleId of roleIds) {
        permissions.push({
            id: roleId,
            allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
            ],
        });
    }
}

export {
    createBasePermissions,
    addSupportRoles
}