import { ticketService } from "..";
import { askFirst, finish, type ActionFn } from "./manage";

/** Deletes the channel after the option's wait (an open ticket's transcript is saved first). */
export const deleteTicket: ActionFn = async (inv, ctx) => {
    if (await askFirst(inv, ctx, "delete")) return;
    await finish(inv, await ticketService.delete(inv.channel, inv.member, ctx));
};
