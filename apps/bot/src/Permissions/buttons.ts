import { CLOSED_ACTIONS, OPEN_ACTIONS, TICKET_ACTION_INFO, type TicketControls } from "@robo/shared";
import { button, slotRows, type Row, type SlotItem } from "@/lib/messagePayload";
import { IDS } from "@/ticket/types";

// A ticket's controls as Discord rows: the open ticket's (Close, Claim, Rename…) or the closed notice's (Reopen,
// Transcript, Delete), each a button or an entry in the one menu, exactly as the dashboard shows them. The closed
// message places its controls on its own (closedPlacement), so Transcript can be a menu entry there and a button in
// the open ticket. Hidden controls are left out.

export function controlRows(c: TicketControls, closed: boolean): Row[] {
    const actions = (closed ? CLOSED_ACTIONS : OPEN_ACTIONS).filter((a) => a === "close" || c.items[a].shown);
    const items: SlotItem[] = actions.map((a) => {
        const it = c.items[a];
        return {
            placement: closed ? it.closedPlacement : it.placement,
            button: button(IDS.control(a), it.label, it.emoji, it.style),
            option: { label: it.label || TICKET_ACTION_INFO[a].name, value: a, description: it.description, emoji: it.emoji },
        };
    });
    return slotRows(items, IDS.controlMenu, closed ? c.closedPlaceholder : c.placeholder);
}
