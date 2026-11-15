import { MessageFlags, type ButtonInteraction, type ChatInputCommandInteraction, type GuildMember, type Message, type ModalSubmitInteraction, type StringSelectMenuInteraction, type TextChannel } from "discord.js";
import { Logger } from "@robo/logger";
import type { Invocation } from "@/ticket/actions";
import { confirmRow } from "@/ticket/TicketModalCreate";
import { SettingsRepository } from "@robo/db";

// Builds the "invocation" every ticket action runs on (see ticket/actions/manage.ts), from a button / menu / popup, a
// slash command, or a typed command. Interactions answer privately; typed commands answer in the channel.

type Component = ButtonInteraction | StringSelectMenuInteraction | ModalSubmitInteraction | ChatInputCommandInteraction;
const settings = new SettingsRepository();

async function say(i: Component, text: string, files?: { attachment: Buffer; name: string }[]) {
    const payload = { content: text, files, allowedMentions: { parse: [] as [] } };
    try {
        if (i.deferred && !i.replied) await i.editReply(payload);
        else if (i.replied) await i.followUp({ ...payload, flags: MessageFlags.Ephemeral });
        else await i.reply({ ...payload, flags: MessageFlags.Ephemeral });
    } catch (err) {
        Logger.warn(`[reply] ${(err as Error).message}`);
    }
}

export function fromInteraction(i: Component, args: Invocation["args"] = {}): Invocation {
    const channel = i.channel as TextChannel;
    const fresh = !i.deferred && !i.replied;
    const fromComponent = i.isButton() || i.isStringSelectMenu();
    return {
        channel,
        member: i.member as GuildMember,
        args,
        reply: (text, files) => say(i, text, files),
        announce: async (msg) => { await channel.send((typeof msg === "string" ? { content: msg, allowedMentions: { parse: [] } } : msg) as never).catch(() => null); },
        showModal: fresh && !i.isModalSubmit() ? (modal) => i.showModal(modal) : undefined,
        confirm: fromComponent && fresh ? async (action, question) => {
            const locale = (await settings.get(channel.guild.id)).general.language;
            if (typeof question === "string") {
                await i.reply({ content: question, components: [confirmRow(action, locale)] as never, flags: MessageFlags.Ephemeral }).catch(() => say(i, question));
                return;
            }
            // A designed confirmation: its message, with the Yes button under it.
            await i.reply({ ...question, components: [...question.components, confirmRow(action, locale)], flags: (question.flags ?? 0) | MessageFlags.Ephemeral } as never).catch(() => say(i, "?"));
        } : undefined,
    };
}

export function fromMessage(message: Message<true>, args: Invocation["args"]): Invocation {
    const channel = message.channel as TextChannel;
    return {
        channel,
        member: message.member as GuildMember,
        args,
        reply: async (text, files) => { await message.reply({ content: text, files, allowedMentions: { parse: [], repliedUser: false } }).catch(() => null); },
        announce: async (msg) => { await channel.send((typeof msg === "string" ? { content: msg, allowedMentions: { parse: [] } } : msg) as never).catch(() => null); },
    };
}
