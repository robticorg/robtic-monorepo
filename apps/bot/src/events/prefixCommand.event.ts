import { Events, type Message } from "discord.js";
import { SettingsRepository } from "@robo/db";
import { t } from "@robo/shared";
import { mentionedId, parseCommand } from "@/handlers/message.hendler";
import { fromMessage } from "@/lib/invocation";
import { checkPrefix, parsePrefixCommand, prefixText } from "@/lib/prefix";
import { PermissionFlagsBits } from "discord.js";
import { ACTIONS, runCome, runSleep, runControl } from "@/ticket/actions";

const settings = new SettingsRepository();

/** Typed commands in a ticket: !close [reason], !rename <name>, !add @member, !come… (or their Arabic and extra words). */
export default {
    name: Events.MessageCreate,
    run: async (message: Message) => {
        if (!message.inGuild() || message.author.bot || !message.member) return;
        const s = await settings.get(message.guildId);
        const quiet = { parse: [] as never[], repliedUser: false };
        // Mentioning the bot alone tells the prefix (for when it's forgotten).
        if (message.content.trim() === `<@${message.client.user.id}>` || message.content.trim() === `<@!${message.client.user.id}>`) {
            await message.reply({ content: prefixText.current(s.general.prefix), allowedMentions: quiet }).catch(() => null);
            return;
        }
        // !prefix ? — show or change the prefix (Manage Server to change).
        const pc = parsePrefixCommand(message.content, s.general.prefix);
        if (pc) {
            if (!pc.rest) return void (await message.reply({ content: prefixText.current(s.general.prefix), allowedMentions: quiet }).catch(() => null));
            if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) return void (await message.reply({ content: prefixText.noPermission(), allowedMentions: quiet }).catch(() => null));
            const check = checkPrefix(pc.rest);
            if (!check.ok) return void (await message.reply({ content: prefixText.invalid(check.reason), allowedMentions: quiet }).catch(() => null));
            await settings.setPrefix(message.guildId, check.prefix);
            return void (await message.reply({ content: prefixText.changed(check.prefix), allowedMentions: quiet }).catch(() => null));
        }
        const cmd = parseCommand(message.content, s.general.prefix, s.commands);
        if (!cmd) return;
        if (!cmd.enabled) {
            await message.reply({ content: t(s.general.language, "cmd.off"), allowedMentions: { parse: [], repliedUser: false } }).catch(() => null);
            return;
        }
        const targetId = mentionedId(cmd.rest);
        const target = targetId ? await message.guild.members.fetch(targetId).catch(() => null) : null;
        if (cmd.command === "come") return await runCome(fromMessage(message, { target }));
        if (cmd.command === "sleep") return await runSleep(fromMessage(message, {}));
        const args = cmd.command === "close" ? { reason: cmd.rest || null } : cmd.command === "rename" ? { name: cmd.rest || null } : { target };
        await runControl(cmd.command, fromMessage(message, args), ACTIONS);
    },
};
