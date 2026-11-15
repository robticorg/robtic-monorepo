import { ticketService } from "..";
import { finish, type ActionFn } from "./manage";

/** Claim, or unclaim when the claimer presses again. */
export const claimTicket: ActionFn = async (inv, ctx) => finish(inv, await ticketService.claim(inv.channel, inv.member, ctx));
