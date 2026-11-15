import { t } from "@robo/shared";
import { ticketService } from "..";
import { memberModal } from "../TicketModalCreate";
import { finish, type ActionFn } from "./manage";

/** From a button: a popup with a member picker. From a command: the member mentioned. */
export const addMember: ActionFn = async (inv, ctx) => {
    const locale = ctx.settings.general.language;
    if (!inv.args.target) {
        if (inv.showModal) return inv.showModal(memberModal("add", locale));
        return inv.reply(t(locale, "cmd.usage", { usage: `${ctx.settings.general.prefix}add @member` }));
    }
    await finish(inv, await ticketService.add(inv.channel, inv.member, ctx, inv.args.target));
};
