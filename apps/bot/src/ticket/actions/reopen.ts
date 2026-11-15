import { ticketService } from "..";
import { finish, type ActionFn } from "./manage";

export const reopenTicket: ActionFn = async (inv, ctx) => finish(inv, await ticketService.reopen(inv.channel, inv.member, ctx));
