import { Logger } from "@robo/logger";
import type { TicketSettings } from "@robo/shared";

// Robtic Staff link: the staff member who claims a ticket gets the points set on the dashboard (Settings → Robtic
// Staff), through Robtic Staff's points API. Robtic Staff decides the rest: people who aren't its staff are ignored,
// staff on a break get break points, and the idempotency key means one claim never counts twice.
//
//   STAFF_POINTS_API_URL    defaults to robtic-staff on the stack's internal network
//   STAFF_POINTS_API_TOKEN  Robtic Staff's INTERNAL_API_TOKEN (empty: its API is open)

const URL_ = (process.env.STAFF_POINTS_API_URL?.trim() || "http://robtic-staff:8788/internal/staff/points").replace(/\/+$/, "");

export async function sendClaimPoints(settings: TicketSettings, guildId: string, userId: string, ticket: { channelId: string; number: number }): Promise<void> {
    const sp = settings.general.staffPoints;
    if (!sp?.enabled || !(sp.perClaim > 0)) return;
    const token = process.env.STAFF_POINTS_API_TOKEN?.trim();
    try {
        const res = await fetch(URL_, {
            method: "POST",
            headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
            body: JSON.stringify({
                guildId,
                userId,
                amount: sp.perClaim,
                type: "ticket",
                reason: `Claimed ticket #${ticket.number}`,
                idempotencyKey: `ticket-claim:${ticket.channelId}:${userId}`,
            }),
            signal: AbortSignal.timeout(5000),
        });
        const body = (await res.json().catch(() => null)) as { ignored?: boolean; duplicate?: boolean; error?: string } | null;
        if (!res.ok) Logger.warn(`[staff points] ${res.status} for ${userId} in ${guildId}: ${body?.error ?? "no reason"}`);
        else if (!body?.ignored && !body?.duplicate) Logger.info(`[staff points] +${sp.perClaim} to ${userId} for ticket #${ticket.number}`);
    } catch (err) {
        // Robtic Staff not in this stack or down: the claim itself still worked.
        Logger.warn(`[staff points] couldn't reach Robtic Staff: ${(err as Error).message}`);
    }
}
