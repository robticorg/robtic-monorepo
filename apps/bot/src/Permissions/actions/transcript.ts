import { Interaction } from "discord.js";
import { TicketService } from "@robo/db";
import { InteractionUtils } from "@/lib/interactionUtils";
import { Created } from "@/components/_embeds/TicketEmbed"; // Assuming available
import { TicketActionServices } from "@/Permissions/roles";

export const transcriptTicket = async (
    interaction: Interaction,
    channelId: string | undefined,
    services: TicketActionServices
) => {
   await InteractionUtils.safeReply(
        interaction,
        "📄 Transcript functionality coming soon.",
    );
};
