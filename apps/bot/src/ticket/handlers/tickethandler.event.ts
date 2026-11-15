import { Events, MessageFlags, type ButtonInteraction, type GuildMember, type Interaction, type Message, type StringSelectMenuInteraction } from "discord.js";
import { Logger } from "@robo/logger";
import { SettingsRepository } from "@robo/db";
import { resolvePlaces, t, TICKET_ACTIONS, type TicketAction } from "@robo/shared";
import { fromInteraction } from "@/lib/invocation";
import { ticketService } from "..";
import { ACTIONS, runControl } from "../actions";
import { questionsModal } from "../TicketModalCreate";
import { infoPanelClick, showInfoPanel } from "../infoPanels";
import { IDS, infoPanelOf } from "../types";
import { isTicketId } from "../utils";

// Every Robtic Ticket button and menu: a panel's options (open a ticket, after its form when it has one), a ticket's
// controls, info buttons (show an info panel to whoever pressed) and what's inside info panels, and "Yes" on an "are
// you sure?". Options, controls and info buttons can each be a button or an entry in the message's menu.

const settings = new SettingsRepository();
const isAction = (v: string): v is TicketAction => (TICKET_ACTIONS as readonly string[]).includes(v);

// Discord keeps a member's pick showing in a menu. Shortly after each pick the message is redrawn with its current
// components, so the menu is empty again for the next choice. Picks close together on one message share one redraw,
// and the message is read again first so a change an action just made (a ticket closing) is never undone.
const RESET_MS = 1500;
const resetting = new Map<string, ReturnType<typeof setTimeout>>();
function resetMenu(message: Message) {
    if (resetting.has(message.id)) return;
    resetting.set(message.id, setTimeout(async () => {
        resetting.delete(message.id);
        const fresh = await message.fetch(true).catch(() => null);
        if (fresh?.editable) await fresh.edit({ components: fresh.components }).catch((e) => Logger.warn(`[TicketHandler] menu reset: ${e}`));
    }, RESET_MS));
}

async function openFromPanel(interaction: ButtonInteraction<"cached"> | StringSelectMenuInteraction<"cached">, panelId: string, optionId: string) {
    const s = await settings.get(interaction.guildId);
    const panel = s.panels.find((p) => p.id === panelId);
    const option = panel?.options.find((o) => o.id === optionId);
    // Blacklisted members are told before any form.
    if (panel && option && resolvePlaces(s.general, panel, option).blacklistRoleIds.some((id) => interaction.member.roles.cache.has(id))) {
        return interaction.reply({ content: t(s.general.language, "open.blacklisted"), flags: MessageFlags.Ephemeral });
    }
    // With a form: the popup first (it must be the first answer), the ticket opens when it's sent.
    if (option?.enabled && option.questions.length) return interaction.showModal(questionsModal(panelId, option, s.general.language));
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const r = await ticketService.open(interaction.guild, interaction.member as GuildMember, panelId, optionId);
    await interaction.editReply({ content: r.text, allowedMentions: { parse: [] } });
}

export default {
    name: Events.InteractionCreate,
    run: async (interaction: Interaction) => {
        if (!(interaction.isButton() || interaction.isStringSelectMenu())) return;
        if (!interaction.inCachedGuild() || !isTicketId(interaction.customId)) return;
        const id = interaction.customId;
        if (interaction.isStringSelectMenu()) resetMenu(interaction.message);
        try {
            const [, kind, a, b] = id.split(":");
            if (interaction.isButton() && kind === "o" && a && b) return await openFromPanel(interaction, a, b);
            if (interaction.isButton() && kind === "v" && a) return await showInfoPanel(interaction, a);
            if (kind === "x" && a && b) return await infoPanelClick(interaction, a, b);
            if (interaction.isStringSelectMenu() && kind === "vm") {
                const info = infoPanelOf(interaction.values[0] ?? "");
                if (info) await showInfoPanel(interaction, info);
                return;
            }
            if (interaction.isStringSelectMenu() && kind === "m" && a) {
                const value = interaction.values[0];
                const info = value ? infoPanelOf(value) : null;
                if (info) return await showInfoPanel(interaction, info);
                if (value) await openFromPanel(interaction, a, value);
                return;
            }
            if (interaction.isButton() && kind === "c" && a && isAction(a)) return await runControl(a, fromInteraction(interaction), ACTIONS);
            // "Yes" on the confirmation: run it, skipping the question (a reason popup may still follow).
            if (interaction.isButton() && kind === "y" && a && isAction(a)) return await runControl(a, fromInteraction(interaction, { confirmed: true }), ACTIONS);
            if (interaction.isStringSelectMenu() && id === IDS.controlMenu) {
                const action = interaction.values[0];
                const info = action ? infoPanelOf(action) : null;
                if (info) return await showInfoPanel(interaction, info);
                if (action && isAction(action)) await runControl(action, fromInteraction(interaction), ACTIONS);
                return;
            }
        } catch (err) {
            Logger.error(`[TicketHandler] ${id}`, err);
            const text = t((await settings.get(interaction.guildId)).general.language, "error");
            if (interaction.deferred || interaction.replied) await interaction.followUp({ content: text, flags: MessageFlags.Ephemeral }).catch(() => null);
            else await interaction.reply({ content: text, flags: MessageFlags.Ephemeral }).catch(() => null);
        }
    },
};
