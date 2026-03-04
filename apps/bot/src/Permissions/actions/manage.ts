import { Interaction } from "discord.js";
import { TicketService } from "@robo/db";
import { InteractionUtils } from "@/lib/interactionUtils";
import { Managed } from "@/components/_embeds/TicketEmbed"; 
import { row } from "@/Permissions/buttons";
import { TicketActionServices } from "@/Permissions/roles";

export const manageTicket = async (
    interaction: Interaction,
    channelId: string | undefined,
    services: TicketActionServices
) => {
    // Only works if interaction is repliable (ButtonInteraction)
    if (interaction.isRepliable()) {
        await interaction.reply({
            embeds: [Managed()],
            components: [row(["add", "remove", "claim", "rename", "transfer"])],
            ephemeral: true 
        });
    }
};
