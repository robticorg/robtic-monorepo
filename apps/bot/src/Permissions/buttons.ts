import { CLOSED_ACTIONS, OPEN_ACTIONS, TICKET_ACTION_INFO, type TicketControls } from "@robo/shared";
import { button, buttonRows, menuRow, type Row } from "@/lib/messagePayload";
import { IDS } from "@/ticket/types";

// A ticket's controls as Discord rows: the open ticket's (Close, Claim, Rename…) or the closed notice's (Reopen,
// Transcript, Delete), as buttons or one menu, exactly as the dashboard shows them. Hidden controls are left out.

export function controlRows(c: TicketControls, closed: boolean): Row[] {
    const actions = (closed ? CLOSED_ACTIONS : OPEN_ACTIONS).filter((a) => a === "close" || c.items[a].shown);
    if (!actions.length) return [];
    if ((closed ? c.closedDisplay : c.display) === "menu") {
        return [menuRow(IDS.controlMenu, closed ? c.closedPlaceholder : c.placeholder, actions.map((a) => ({
            label: c.items[a].label || TICKET_ACTION_INFO[a].name,
            value: a,
            description: c.items[a].description,
            emoji: c.items[a].emoji,
        })))];
    }
    return buttonRows(actions.map((a) => button(IDS.control(a), c.items[a].label, c.items[a].emoji, c.items[a].style)));
}
