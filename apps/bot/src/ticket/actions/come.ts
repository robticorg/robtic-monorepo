import { t } from "@robo/shared";
import { ticketService } from "..";
import { contextOf } from "../utils";
import { finish, type Invocation } from "./manage";

/** !come / /come: not a ticket control, so its own checks live in the service (Come page on the dashboard). */
export async function runCome(inv: Invocation) {
    const ctx = await contextOf(inv.channel.guild.id, inv.channel.id);
    if (!ctx) return inv.reply(t("en", "notTicket"));
    await finish(inv, await ticketService.come(inv.channel, inv.member, ctx, inv.args.target ?? null));
}
