import type { Guild, GuildMember } from "discord.js";
import { t, type Locale, type MessageKey, type TicketAction, type TicketCome, type TicketOption, type TicketPanel } from "@robo/shared";
import { button, emojiOf, fill, renderMessage, slotRows, type Payload, type Row, type SlotItem, type Vars } from "@/lib/messagePayload";
import { controlRows } from "@/Permissions/buttons";
import { IDS, type TicketContext } from "./types";

// The messages the bot posts: a panel (its design with the ticket options), a new ticket's welcome (with its controls),
// the form answers, the closed message (with Reopen / Transcript / Delete), the !come direct message, and the one-line
// notices after a control (the dashboard's text, or the built-in line in the server's language).

export function panelPayload(panel: TicketPanel, guild: Guild): Payload {
    const items: SlotItem[] = [
        ...panel.options.map((o): SlotItem => ({
            placement: o.placement,
            button: button(IDS.open(panel.id, o.id), o.label, o.emoji, o.style),
            option: { label: o.label, value: o.id, description: o.description, emoji: o.emoji },
        })),
    ];
    return renderMessage(panel.message, { server: guild.name }, slotRows(items, IDS.menu(panel.id), panel.placeholder));
}

export function ticketVars(guild: Guild, owner: GuildMember | { id: string; displayName: string }, option: Pick<TicketOption, "label" | "supportRoleIds">, number: number, channelId?: string): Vars {
    return {
        user: `<@${owner.id}>`,
        username: owner.displayName,
        support: option.supportRoleIds.map((id) => `<@&${id}>`).join(" "),
        option: option.label,
        number: String(number).padStart(4, "0"),
        server: guild.name,
        channel: channelId ? `<#${channelId}>` : "",
    };
}

/** The words of a ticket that already exists. */
export async function varsOf(guild: Guild, ctx: TicketContext): Promise<Vars> {
    const owner = await guild.members.fetch(ctx.ticket.ownerId).catch(() => null);
    const option = ctx.option ?? { label: ctx.ticket.optionLabel, supportRoleIds: [] };
    return ticketVars(guild, owner ?? { id: ctx.ticket.ownerId, displayName: ctx.ticket.ownerId }, option, ctx.ticket.number, ctx.ticket.channelId);
}

/** The welcome message: the option's design with its controls; it pings the owner and the support roles only. */
export function welcomePayload(option: TicketOption, vars: Vars, ownerId: string): Payload {
    return renderMessage(option.welcome, vars, controlRows(option.controls, false), { users: [ownerId], roles: option.supportRoleIds });
}

export function answersPayload(locale: Locale, ownerId: string, answers: { question: string; answer: string }[]): Payload {
    return {
        embeds: [{
            description: t(locale, "open.answers", { user: `<@${ownerId}>` }),
            color: 0x1793ff,
            fields: answers.slice(0, 25).map((a) => ({ name: a.question.slice(0, 256) || "?", value: (a.answer || "—").slice(0, 1024) })),
        }],
        components: [],
        allowedMentions: { parse: [] },
    };
}

/** The closed message: the option's design ({closer} and {reason} filled in) with the closed controls. Pings nobody. */
export function closedPayload(locale: Locale, option: TicketOption, vars: Vars, by: string, reason: string | null): Payload {
    return renderMessage(option.closed, { ...vars, closer: `<@${by}>`, reason: reason || t(locale, "closed.noReason") }, controlRows(option.controls, true), { users: [], roles: [] });
}

/** The !come direct message, with its "Go to the ticket" link button. */
export function comePayload(come: TicketCome, vars: Vars, url: string): Payload {
    const e = emojiOf(come.button.emoji);
    const label = come.button.label.trim();
    const link: Row = { type: 1, components: [{ type: 2, style: 5, url, ...(label ? { label: label.slice(0, 80) } : {}), ...(e ? { emoji: e } : {}) }] };
    return renderMessage(come.message, vars, [link], { users: [], roles: [] });
}

const BUILT_IN: Partial<Record<TicketAction, MessageKey>> = {
    claim: "claimed", rename: "renamed", add: "added", remove: "removed", transfer: "transferred", reopen: "reopened",
};

/**
 * What the bot says after a control: the dashboard's text for it ({staff} {member} {name} and the ticket's words), else
 * the built-in line in the server's language. `builtIn` forces a built-in line (e.g. "unclaimed").
 */
export function noticeText(ctx: TicketContext, action: TicketAction, vars: Vars, who: { staff: string; member?: string; name?: string }, builtIn?: MessageKey): string {
    const custom = ctx.option?.controls.items[action]?.notice?.trim();
    if (custom && !builtIn) return fill(custom, { ...vars, staff: who.staff, member: who.member ?? "", name: who.name ?? "" });
    const key = builtIn ?? BUILT_IN[action];
    if (!key) return "";
    // The built-in lines call whoever acted (or the member added/removed) {user}, and a transfer {from} → {to}.
    const user = action === "add" || action === "remove" ? who.member ?? "" : who.staff;
    return t(ctx.settings.general.language, key, { user, from: who.staff, to: who.member ?? "", name: who.name ?? "" });
}
