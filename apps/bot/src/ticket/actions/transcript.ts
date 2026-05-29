import { Interaction } from "discord.js";
import { TicketRepository } from "@robo/db";
import { InteractionUtils } from "@/lib/interactionUtils";
import { Created } from "@/ticket/TicketEmbed"; // Assuming available
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
