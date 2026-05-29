import { TicketStatus } from "@robo/shared";

export class TicketStateMachine {

    canOpen(state : TicketStatus) {
        return state || state === "CLOSED";
    }

    canClose(state : TicketStatus) {
        return state === "OPEN";
    }

    canReopen(state : TicketStatus) {
        return state === "CLOSED";
    }

    canDelete(state : TicketStatus) {
        return state === "OPEN" || state === "CLOSED";
    }
    
}