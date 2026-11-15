import { t } from "@robo/shared";
import { ticketService } from "..";
import { closeReasonModal } from "../TicketModalCreate";
import { askFirst, type ActionFn } from "./manage";

/** Close: "are you sure?" and a reason popup when the option asks for them (a command's argument is its reason). */
export const closeTicket: ActionFn = async (inv, ctx) => {
    const locale = ctx.settings.general.language;
    if (await askFirst(inv, ctx, "close")) return;
    if (ctx.option?.controls.items.close.reason && inv.args.reason === undefined && inv.showModal) return inv.showModal(closeReasonModal(locale));
    const r = await ticketService.close(inv.channel, inv.member, ctx, inv.args.reason?.trim() || null);
    // The closed message is already in the channel: the person only gets a short confirmation.
    await inv.reply(r.ok ? t(locale, "closed.saved") : r.text);
};
