import { TicketRepository } from "@robo/db";
import type { TicketOption } from "@robo/shared";

const tickets = new TicketRepository();

/** The member's open tickets of this option, when they've reached its limit (0 = no limit); otherwise null. */
export async function overLimit(guildId: string, userId: string, option: TicketOption): Promise<string[] | null> {
    if (!option.perMember) return null;
    const open = await tickets.openOf(guildId, userId, option.id);
    return open.length >= option.perMember ? open.map((t) => t.channelId) : null;
}
