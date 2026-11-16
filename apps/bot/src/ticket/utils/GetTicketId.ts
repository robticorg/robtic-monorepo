import { SettingsRepository, TicketRepository } from "@robo/db";
import { withStaffRoles } from "@robo/shared";
import type { TicketContext } from "../types";

const tickets = new TicketRepository();
const settings = new SettingsRepository();

/**
 * A channel's ticket with its settings, panel and option; null when the channel isn't a ticket. The option's staff
 * roles (support and manager) are already resolved: its own, else its panel's, else the server's, or none.
 */
export async function contextOf(guildId: string, channelId: string): Promise<TicketContext | null> {
    const ticket = await tickets.byChannel(channelId);
    if (!ticket || ticket.guildId !== guildId) return null;
    const s = await settings.get(guildId);
    const panel = s.panels.find((p) => p.id === ticket.panelId) ?? null;
    // The option may have moved to another panel: find it anywhere before giving up.
    const home = panel?.options.some((o) => o.id === ticket.optionId) ? panel : s.panels.find((p) => p.options.some((o) => o.id === ticket.optionId)) ?? null;
    const raw = home?.options.find((o) => o.id === ticket.optionId) ?? null;
    const option = raw ? withStaffRoles(s.general, home, raw) : null;
    return { ticket, settings: s, panel, option };
}
