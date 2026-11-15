import { PermissionFlagsBits, type GuildMember } from "discord.js";
import type { TicketAction, TicketTarget, TicketWho } from "@robo/shared";
import type { TicketContext } from "@/ticket/types";

// Who a member is to a ticket (owner, claimer, added, support, manager, everyone), and so what they may do: each control
// lists the people and roles who may use it on the dashboard. Server administrators may always.

export function rolesOf(member: GuildMember, ctx: TicketContext): Set<TicketTarget> {
    const out = new Set<TicketTarget>(["everyone"]);
    const t = ctx.ticket;
    if (t.ownerId === member.id) out.add("owner");
    if (t.claimerId === member.id) out.add("claimer");
    if (t.addedIds.includes(member.id)) out.add("added");
    const has = (ids: string[] | undefined) => (ids ?? []).some((id) => member.roles.cache.has(id));
    if (has(ctx.option?.supportRoleIds)) out.add("support");
    if (has(ctx.option?.managerRoleIds)) out.add("manager");
    return out;
}

export const isAdmin = (member: GuildMember) => member.permissions.has(PermissionFlagsBits.Administrator);

/** Whether this member is one of `who`: one of the ticket's people listed, or holding one of its roles. */
export function isOneOf(member: GuildMember, ctx: TicketContext, who: TicketWho): boolean {
    if (isAdmin(member)) return true;
    const mine = rolesOf(member, ctx);
    return who.who.some((w) => mine.has(w)) || who.roleIds.some((id) => member.roles.cache.has(id));
}

/** Whether this member may use this control (button, menu or command) in this ticket. */
export function canUse(member: GuildMember, ctx: TicketContext, action: TicketAction): boolean {
    const item = ctx.option?.controls.items[action];
    return isOneOf(member, ctx, item ?? { who: ["manager"], roleIds: [] });
}

/** Staff of this option: may be given a ticket (transfer) or claim it. */
export const isStaff = (member: GuildMember, ctx: TicketContext) => isAdmin(member) || rolesOf(member, ctx).has("support") || rolesOf(member, ctx).has("manager");
