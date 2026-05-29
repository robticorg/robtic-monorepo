import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { TicketPermissions, type TicketPermission } from "./permissions";

export type ButtonType = "close" | "claim" | "transcript" | "reopen" | "manage" | "delete" | "add" | "remove" | "rename" | "transfer";

export interface ButtonConfig {
    id: ButtonType;
    label: string;
    style: ButtonStyle;
    emoji: string;
    permission?: TicketPermission;
}

export const Buttons: Record<ButtonType, ButtonConfig> = {
    close: {
        id: "close",
        label: "Close",
        style: ButtonStyle.Secondary,
        emoji: "🔒",
        permission: TicketPermissions.Close
    },
    manage: {
        id: "manage",
        label: "Manage",
        style: ButtonStyle.Secondary,
        emoji: "⚙️",
        permission: TicketPermissions.Manage
    },
    claim: {
        id: "claim",
        label: "Claim",
        style: ButtonStyle.Secondary,
        emoji: "📝",
        permission: TicketPermissions.Claim
    },
    transcript: {
        id: "transcript",
        label: "Transcript",
        style: ButtonStyle.Secondary,
        emoji: "📄",
        permission: TicketPermissions.Transcript
    },
    reopen: {
        id: "reopen",
        label: "Reopen",
        style: ButtonStyle.Secondary,
        emoji: "🔓",
        permission: TicketPermissions.Reopen
    },
    delete: {
        id: "delete",
        label: "Delete",
        style: ButtonStyle.Danger,
        emoji: "🗑️",
        permission: TicketPermissions.Delete
    },
    add: {
        id: "add",
        label: "Add Member",
        style: ButtonStyle.Primary,
        emoji: "➕",
        permission: TicketPermissions.Add
    },
    remove: {
        id: "remove",
        label: "Remove Member",
        style: ButtonStyle.Danger,
        emoji: "➖",
        permission: TicketPermissions.Remove
    },
    rename: {
        id: "rename",
        label: "Rename",
        style: ButtonStyle.Secondary,
        emoji: "✏️",
        permission: TicketPermissions.Rename
    },
    transfer: {
        id: "transfer",
        label: "Transfer",
        style: ButtonStyle.Primary,
        emoji: "🔄",
        permission: TicketPermissions.Transfer
    }
};

export const build = (id: ButtonType) => {
    const config = Buttons[id];
    if (!config) throw new Error(`Button config for ${id} not found`);

    return new ButtonBuilder()
        .setCustomId(config.id)
        .setLabel(config.label)
        .setStyle(config.style)
        .setEmoji(config.emoji);
};

export const row = (buttons: ButtonType[]) => {
    const row = new ActionRowBuilder<ButtonBuilder>();
    buttons.forEach((id) => row.addComponents(build(id)));
    return row;
};
