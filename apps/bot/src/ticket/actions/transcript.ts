import { t } from "@robo/shared";
import { ticketService } from "..";
import type { ActionFn } from "./manage";

/** Saves the transcript now; the link (and the HTML file) go to the person who asked. */
export const transcriptTicket: ActionFn = async (inv, ctx) => {
    await inv.reply(t(ctx.settings.general.language, "transcript.saving"));
    const r = await ticketService.transcript(inv.channel, ctx);
    await inv.reply(r.text, r.files);
};
