import { t } from "@robo/shared";
import { ticketService } from "..";
import { renameModal } from "../TicketModalCreate";
import { finish, type ActionFn } from "./manage";

export const renameTicket: ActionFn = async (inv, ctx) => {
    const locale = ctx.settings.general.language;
    if (!inv.args.name) {
        if (inv.showModal) return inv.showModal(renameModal(inv.channel.name, locale));
        return inv.reply(t(locale, "cmd.usage", { usage: `${ctx.settings.general.prefix}rename <name>` }));
    }
    await finish(inv, await ticketService.rename(inv.channel, inv.member, ctx, inv.args.name));
};
