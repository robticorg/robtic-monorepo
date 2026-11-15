import { SettingsRepository, TicketRepository } from "@robo/db";
import type { TicketContext } from "../types";

const tickets = new TicketRepository();
const settings = new SettingsRepository();

/** A channel's ticket with its settings, panel and option; null when the channel isn't a ticket. */
export async function contextOf(guildId: string, channelId: string): Promise<TicketContext | null> {
    const ticket = await tickets.byChannel(channelId);
    if (!ticket || ticket.guildId !== guildId) return null;
    const s = await settings.get(guildId);
    const panel = s.panels.find((p) => p.id === ticket.panelId) ?? null;
    // The option may have moved to another panel: find it anywhere before giving up.
    const option = panel?.options.find((o) => o.id === ticket.optionId) ?? s.panels.flatMap((p) => p.options).find((o) => o.id === ticket.optionId) ?? null;
    return { ticket, settings: s, panel, option };
}
