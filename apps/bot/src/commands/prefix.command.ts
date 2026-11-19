import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { SettingsRepository } from "@robo/db";
import { checkPrefix, prefixText } from "@/lib/prefix";

const settings = new SettingsRepository();

/** /prefix [new]: shows the typed-command prefix, or changes it (Manage Server). Same setting as the dashboard. */
export default {
    data: new SlashCommandBuilder()
        .setName("prefix")
        .setDescription("Show or change the prefix for typed commands · عرض أو تغيير البادئة")
        .setDMPermission(false)
        .addStringOption((o) => o.setName("new").setDescription("The new prefix, e.g. ? · البادئة الجديدة").setMaxLength(10)),
    run: async (interaction: ChatInputCommandInteraction) => {
        if (!interaction.inCachedGuild()) return;
        const raw = interaction.options.getString("new");
        if (raw === null) {
            const s = await settings.get(interaction.guildId);
            return interaction.reply({ content: prefixText.current(s.general.prefix), flags: MessageFlags.Ephemeral });
        }
        if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)) return interaction.reply({ content: prefixText.noPermission(), flags: MessageFlags.Ephemeral });
        const check = checkPrefix(raw);
        if (!check.ok) return interaction.reply({ content: prefixText.invalid(check.reason), flags: MessageFlags.Ephemeral });
        await settings.setPrefix(interaction.guildId, check.prefix);
        return interaction.reply({ content: prefixText.changed(check.prefix), flags: MessageFlags.Ephemeral });
    },
};
