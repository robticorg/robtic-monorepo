import { t } from "@robo/shared";
import { remindOwner } from "..";
import { contextOf } from "../utils";
import { finish, type Invocation } from "./manage";

/** /sleep, !sleep, !خمول: remind the owner now and start the countdown (Sleep page on the dashboard). */
export async function runSleep(inv: Invocation) {
    const ctx = await contextOf(inv.channel.guild.id, inv.channel.id);
    if (!ctx) return inv.reply(t("en", "notTicket"));
    await finish(inv, await remindOwner(inv.channel, ctx, inv.member, true));
}
