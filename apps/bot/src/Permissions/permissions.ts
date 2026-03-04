import { PermissionsBitField } from "discord.js";

export const TicketPermissions = {
    Close: [PermissionsBitField.Flags.ManageChannels],
    Reopen: [PermissionsBitField.Flags.ManageChannels],
    Delete: [PermissionsBitField.Flags.ManageChannels],
    Manage: [PermissionsBitField.Flags.ManageChannels],
    Claim: [PermissionsBitField.Flags.SendMessages],
    Transcript: [PermissionsBitField.Flags.SendMessages],
    Add: [PermissionsBitField.Flags.ManageChannels],
    Remove: [PermissionsBitField.Flags.ManageChannels],
    Rename: [PermissionsBitField.Flags.ManageChannels],
    Transfer: [PermissionsBitField.Flags.ManageChannels]
} as const;

export type TicketPermission = readonly bigint[];