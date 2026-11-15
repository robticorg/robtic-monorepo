import { Events, MessageFlags, type GuildMember, type Interaction } from "discord.js";
import { Logger } from "@robo/logger";
import { SettingsRepository } from "@robo/db";
import { t } from "@robo/shared";
import { fromInteraction } from "@/lib/invocation";
import { ticketService } from "..";
import { ACTIONS, runControl } from "../actions";
import { answerOf } from "../TicketModalCreate";
import { IDS } from "../types";

// The popups: an option's form (then the ticket opens with the answers), Rename's new name, Close's reason, and the
// member picked for Add, Remove or Transfer.

const settings = new SettingsRepository();

export default {
    name: Events.InteractionCreate,
    run: async (interaction: Interaction) => {
        if (!interaction.isModalSubmit() || !interaction.inCachedGuild() || !interaction.customId.startsWith("tk:")) return;
        const id = interaction.customId;
        try {
            if (id.startsWith("tk:f:")) {
                const [, , panelId, optionId] = id.split(":");
                if (!panelId || !optionId) return;
                await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                const s = await settings.get(interaction.guildId);
                const option = s.panels.find((p) => p.id === panelId)?.options.find((o) => o.id === optionId);
                const answers = (option?.questions ?? []).map((q) => ({ question: q.label, answer: answerOf(q, interaction, s.general.language) }));
                const r = await ticketService.open(interaction.guild, interaction.member as GuildMember, panelId, optionId, answers);
                await interaction.editReply({ content: r.text, allowedMentions: { parse: [] } });
                return;
            }
            if (id === IDS.rename) {
                await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                return await runControl("rename", fromInteraction(interaction, { name: interaction.fields.getTextInputValue("name") }), ACTIONS);
            }
            if (id === IDS.closeReason) {
                await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                return await runControl("close", fromInteraction(interaction, { reason: interaction.fields.getTextInputValue("reason") || null, confirmed: true }), ACTIONS);
            }
            const [, kind, what] = id.split(":");
            if (kind === "mm" && (what === "add" || what === "remove" || what === "transfer")) {
                await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                const userId = [...(interaction.fields.getSelectedUsers("member")?.keys() ?? [])][0];
                const target = userId ? await interaction.guild.members.fetch(userId).catch(() => null) : null;
                if (!target) return void (await interaction.editReply({ content: t((await settings.get(interaction.guildId)).general.language, "error") }));
                return await runControl(what, fromInteraction(interaction, { target }), ACTIONS);
            }
        } catch (err) {
            Logger.error(`[ModalHandler] ${id}`, err);
            const text = t((await settings.get(interaction.guildId)).general.language, "error");
            if (interaction.deferred || interaction.replied) await interaction.editReply({ content: text }).catch(() => null);
            else await interaction.reply({ content: text, flags: MessageFlags.Ephemeral }).catch(() => null);
        }
    },
};
