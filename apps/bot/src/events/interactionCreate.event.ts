import { Events, MessageFlags, type Interaction } from "discord.js";
import { BotError, handleError } from "@/handlers/error.handler";
import { InteractionUtils } from "@/lib/interactionUtils";
import { msg } from "@/lib/messages";

/** Slash commands (/close, /claim…). Buttons, menus and popups are handled in src/ticket/handlers. */
export default {
    name: Events.InteractionCreate,
    run: async (interaction: Interaction) => {
        if (!interaction.isChatInputCommand()) return;
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) return;
        try {
            await command.run(interaction, interaction.client);
        } catch (err) {
            handleError(new BotError(`/${interaction.commandName}: ${(err as Error).message}`, "COMMAND"), "interactionCreate");
            const text = await msg(interaction.guildId, "error");
            if (interaction.deferred || interaction.replied) await interaction.editReply({ content: text }).catch(() => null);
            else await InteractionUtils.safeReply(interaction, text);
            void MessageFlags;
        }
    },
};
