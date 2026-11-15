import { OverwriteType, type Guild, type OverwriteResolvable } from "discord.js";
import { overwriteBits, type PermOverwrite, type TicketOption } from "@robo/shared";

// A ticket channel's permission overwrites, from the option's permissions on the dashboard: @everyone, the owner, the
// claimer, added members, the support and manager roles, and any other role. The bot always keeps what it needs.

const BOT_NEEDS = { ViewChannel: "allow", SendMessages: "allow", ReadMessageHistory: "allow", EmbedLinks: "allow", AttachFiles: "allow", ManageChannels: "allow", ManageMessages: "allow" } as const;

const empty = (o: PermOverwrite | undefined) => !o || Object.keys(o).length === 0;

function push(list: OverwriteResolvable[], id: string, type: OverwriteType, o: PermOverwrite | undefined) {
    if (empty(o)) return;
    const { allow, deny } = overwriteBits(o!);
    const existing = list.findIndex((x) => x.id === id);
    if (existing >= 0) list.splice(existing, 1);
    list.push({ id, type, allow: BigInt(allow), deny: BigInt(deny) });
}

export interface TicketPeople {
    ownerId: string;
    claimerId: string | null;
    addedIds: string[];
    /** Closed: the option's "once closed" permissions apply instead of its "while open" ones. */
    closed?: boolean;
}

export function ticketOverwrites(guild: Guild, option: TicketOption, people: TicketPeople): OverwriteResolvable[] {
    const p = option.permissions[people.closed ? "closed" : "open"];
    const list: OverwriteResolvable[] = [];
    push(list, guild.roles.everyone.id, OverwriteType.Role, p.targets.everyone);
    for (const id of option.supportRoleIds) push(list, id, OverwriteType.Role, p.targets.support);
    for (const id of option.managerRoleIds) push(list, id, OverwriteType.Role, p.targets.manager);
    for (const [id, o] of Object.entries(p.roles)) push(list, id, OverwriteType.Role, o);
    for (const id of people.addedIds) push(list, id, OverwriteType.Member, p.targets.added);
    push(list, people.ownerId, OverwriteType.Member, p.targets.owner);
    if (people.claimerId) push(list, people.claimerId, OverwriteType.Member, p.targets.claimer);

    const me = guild.members.me;
    if (me) push(list, me.id, OverwriteType.Member, BOT_NEEDS);
    return list;
}
