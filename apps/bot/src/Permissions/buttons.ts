import { CLOSED_ACTIONS, OPEN_ACTIONS, TICKET_ACTION_INFO, type TicketControls } from "@robo/shared";
import { button, slotRows, type Row, type SlotItem } from "@/lib/messagePayload";
import { infoSlotItems } from "@/ticket/TicketEmbed";
import { IDS } from "@/ticket/types";

// A ticket's controls as Discord rows: the open ticket's (Close, Claim, Rename…) or the closed notice's (Reopen,
// Transcript, Delete), each a button or an entry in the one menu, exactly as the dashboard shows them; the open ticket's
// info buttons sit among them. Hidden controls are left out.

export function controlRows(c: TicketControls, closed: boolean): Row[] {
    const actions = (closed ? CLOSED_ACTIONS : OPEN_ACTIONS).filter((a) => a === "close" || c.items[a].shown);
    const items: SlotItem[] = actions.map((a) => {
        const it = c.items[a];
        return {
            placement: it.placement,
            button: button(IDS.control(a), it.label, it.emoji, it.style),
            option: { label: it.label || TICKET_ACTION_INFO[a].name, value: a, description: it.description, emoji: it.emoji },
        };
    });
    if (!closed) items.push(...infoSlotItems(c.info));
    return slotRows(items, IDS.controlMenu, closed ? c.closedPlaceholder : c.placeholder);
}
