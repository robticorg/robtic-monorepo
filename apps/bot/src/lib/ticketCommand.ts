import { MessageFlags, SlashCommandBuilder, type ChatInputCommandInteraction, type GuildMember } from "discord.js";
import { SettingsRepository } from "@robo/db";
import { t, type TicketCommand } from "@robo/shared";
import { ACTIONS, runCome, runControl, runSleep } from "@/ticket/actions";
import { fromInteraction } from "./invocation";

// The slash commands, one per ticket control (/close, /claim, /rename…) and /come. Discord has no Arabic locale for
// command names, so each description says it in both languages; the typed commands (!close, !اغلاق…) take the Arabic
// words. A command turned off on the Commands page answers that it's off.

const settings = new SettingsRepository();

const DESCRIPTIONS: Record<TicketCommand, string> = {
    close: "Close this ticket · إغلاق التذكرة",
    claim: "Claim this ticket (again to unclaim) · استلام التذكرة",
    rename: "Rename this ticket · تغيير اسم التذكرة",
    add: "Add a member to this ticket · إضافة عضو",
    remove: "Remove a member from this ticket · إزالة عضو",
    transfer: "Give this ticket to another staff member · تحويل التذكرة",
    transcript: "Save this ticket's transcript now · حفظ نسخة المحادثة",
    reopen: "Reopen this closed ticket · إعادة فتح التذكرة",
    delete: "Delete this ticket channel · حذف التذكرة",
    come: "Call the owner back with a direct message · استدعاء صاحب التذكرة",
    sleep: "Remind the owner now and start the sleep countdown · تذكير صاحب التذكرة",
};

export function ticketCommand(command: TicketCommand) {
    const data = new SlashCommandBuilder().setName(command).setDescription(DESCRIPTIONS[command]).setDMPermission(false);
    if (command === "close") data.addStringOption((o) => o.setName("reason").setDescription("Why it is closed · سبب الإغلاق").setMaxLength(500));
    if (command === "rename") data.addStringOption((o) => o.setName("name").setDescription("The new name · الاسم الجديد").setRequired(true).setMaxLength(90));
    if (command === "add" || command === "remove" || command === "transfer") data.addUserOption((o) => o.setName("member").setDescription("The member · العضو").setRequired(true));
    if (command === "come") data.addUserOption((o) => o.setName("member").setDescription("Someone other than the owner · عضو آخر غير صاحب التذكرة"));

    return {
        data,
        run: async (interaction: ChatInputCommandInteraction) => {
            if (!interaction.inCachedGuild()) return interaction.reply({ content: t("en", "notTicket"), flags: MessageFlags.Ephemeral });
            const s = await settings.get(interaction.guildId);
            if (!s.commands[command].enabled) return interaction.reply({ content: t(s.general.language, "cmd.off"), flags: MessageFlags.Ephemeral });
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            const target = interaction.options.getMember("member") as GuildMember | null;
            if (command === "come") return runCome(fromInteraction(interaction, { target }));
            if (command === "sleep") return runSleep(fromInteraction(interaction));
            const args = {
                ...(command === "close" ? { reason: interaction.options.getString("reason") } : {}),
                ...(command === "rename" ? { name: interaction.options.getString("name") } : {}),
                ...(target ? { target } : {}),
            };
            await runControl(command, fromInteraction(interaction, args), ACTIONS);
        },
    };
}
