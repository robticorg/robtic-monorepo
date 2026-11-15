import type { TicketAction } from "@robo/shared";
import type { TicketDoc } from "@robo/db";

// What can happen to a ticket in its current state: an open ticket can't be reopened, a closed one can't be claimed…

const OPEN_ONLY: readonly TicketAction[] = ["close", "claim", "rename", "add", "remove", "transfer"];
const CLOSED_ONLY: readonly TicketAction[] = ["reopen"];

export class TicketStateMachine {
    allows(ticket: Pick<TicketDoc, "status">, action: TicketAction): "ok" | "closed" | "open" {
        if (ticket.status === "closed" && OPEN_ONLY.includes(action)) return "closed";
        if (ticket.status === "open" && CLOSED_ONLY.includes(action)) return "open";
        return "ok";
    }
}
