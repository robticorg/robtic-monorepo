/**
 * Default permission config seeded for every new guild.
 * `permissions` = Discord PermissionsBitField flag names (strings).
 * `roleIds`     = left empty — guilds configure their own staff roles.
 */
export const DefaultPermissions: { action: string; permissions: string[]; roleIds: string[] }[] = [
    { action: "close",      permissions: ["ManageChannels"],  roleIds: [] },
    { action: "reopen",     permissions: ["ManageChannels"],  roleIds: [] },
    { action: "delete",     permissions: ["ManageChannels"],  roleIds: [] },
    { action: "manage",     permissions: ["ManageChannels"],  roleIds: [] },
    { action: "claim",      permissions: ["SendMessages"],    roleIds: [] },
    { action: "transcript", permissions: ["SendMessages"],    roleIds: [] },
    { action: "add",        permissions: ["ManageChannels"],  roleIds: [] },
    { action: "remove",     permissions: ["ManageChannels"],  roleIds: [] },
    { action: "rename",     permissions: ["ManageChannels"],  roleIds: [] },
    { action: "transfer",   permissions: ["ManageChannels"],  roleIds: [] },
];