import { Events, type Message } from "discord.js";
import { Logger } from "@robo/logger";
import { TicketRepository } from "@robo/db";
import { t, TICKET_PICTURES } from "@robo/shared";
import { contextOf } from "@/ticket/utils";

// Pictures in tickets follow Robtic's own rule (TICKET_PICTURES: one picture per ticket, up to 8 MB): a picture over the
// size, or one past the ticket's allowance, is removed with a short notice. Bots and messages without pictures pass.

const tickets = new TicketRepository();
const isImage = (a: { contentType?: string | null; name?: string | null }) => (a.contentType ?? "").startsWith("image/") || /\.(png|jpe?g|gif|webp|avif|bmp)$/i.test(a.name ?? "");

export default {
    name: Events.MessageCreate,
    run: async (message: Message) => {
        if (!message.inGuild() || message.author.bot) return;
        const images = [...message.attachments.values()].filter(isImage);
        if (!images.length) return;
        const ctx = await contextOf(message.guildId, message.channelId);
        if (!ctx) return;
        const lang = ctx.settings.general.language;
        const user = `<@${message.author.id}>`;
        let notice: string | null = null;
        if (images.some((a) => a.size > TICKET_PICTURES.maxMB * 1024 * 1024)) notice = t(lang, "image.tooBig", { user, mb: String(TICKET_PICTURES.maxMB) });
        else if (!(await tickets.addImages(message.channelId, images.length, TICKET_PICTURES.perTicket))) notice = t(lang, "image.tooMany", { user, max: String(TICKET_PICTURES.perTicket) });
        if (!notice) return;
        await message.delete().catch((e) => Logger.warn(`[images] couldn't remove a picture in ${message.channelId}: ${e}`));
        const sent = await message.channel.send({ content: notice, allowedMentions: { users: [message.author.id] } }).catch(() => null);
        if (sent) setTimeout(() => void sent.delete().catch(() => null), 15_000);
    },
};
