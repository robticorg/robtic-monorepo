import type { TicketAction } from "@robo/shared";
import { addMember } from "./add";
import { claimTicket } from "./claim";
import { closeTicket } from "./close";
import { deleteTicket } from "./delete";
import type { ActionFn } from "./manage";
import { removeMember } from "./remove";
import { renameTicket } from "./rename";
import { reopenTicket } from "./reopen";
import { transcriptTicket } from "./transcript";
import { transferTicket } from "./transfer";
import { runCome } from "./come";
import { runSleep } from "./sleep";

export { closeTicket, reopenTicket, deleteTicket, claimTicket, addMember, removeMember, renameTicket, transferTicket, transcriptTicket };
export { runControl, type Invocation, type ActionFn } from "./manage";
export { runCome, runSleep };

/** Every control's implementation, by action. */
export const ACTIONS: Record<TicketAction, ActionFn> = {
    close: closeTicket,
    claim: claimTicket,
    rename: renameTicket,
    add: addMember,
    remove: removeMember,
    transfer: transferTicket,
    transcript: transcriptTicket,
    // Their own pages decide who may (runControl lets them through to it).
    come: (inv) => runCome(inv),
    sleep: (inv) => runSleep(inv),
    reopen: reopenTicket,
    delete: deleteTicket,
};
