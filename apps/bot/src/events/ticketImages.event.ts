import { Events, type Message } from "discord.js";
import { Logger } from "@robo/logger";
import { TicketRepository } from "@robo/db";
import { resolveLifecycle, t } from "@robo/shared";
import { contextOf } from "@/ticket/utils";

// Picture limits in tickets (the dashboard's Closing and pictures): a picture over the size limit, or one past the
// ticket's limit, is removed with a short notice to whoever posted it. Bots and messages without pictures pass.

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
        const life = resolveLifecycle(ctx.settings.general, ctx.option);
        const lang = ctx.settings.general.language;
        const user = `<@${message.author.id}>`;
        let notice: string | null = null;
        if (life.maxImageMB > 0 && images.some((a) => a.size > life.maxImageMB * 1024 * 1024)) notice = t(lang, "image.tooBig", { user, mb: String(life.maxImageMB) });
        else if (!(await tickets.addImages(message.channelId, images.length, life.maxImages))) notice = t(lang, "image.tooMany", { user, max: String(life.maxImages) });
        if (!notice) return;
        await message.delete().catch((e) => Logger.warn(`[images] couldn't remove a picture in ${message.channelId}: ${e}`));
        const sent = await message.channel.send({ content: notice, allowedMentions: { users: [message.author.id] } }).catch(() => null);
        if (sent) setTimeout(() => void sent.delete().catch(() => null), 15_000);
    },
};
