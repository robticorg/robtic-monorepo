import { t } from "@robo/shared";
import { ticketService } from "..";
import { memberModal } from "../TicketModalCreate";
import { finish, type ActionFn } from "./manage";

/** From a button: a popup with a member picker. From a command: the member mentioned. */
export const removeMember: ActionFn = async (inv, ctx) => {
    const locale = ctx.settings.general.language;
    if (!inv.args.target) {
        if (inv.showModal) return inv.showModal(memberModal("remove", locale));
        return inv.reply(t(locale, "cmd.usage", { usage: `${ctx.settings.general.prefix}remove @member` }));
    }
    await finish(inv, await ticketService.remove(inv.channel, inv.member, ctx, inv.args.target));
};
