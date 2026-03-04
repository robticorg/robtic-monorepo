import { Interaction } from "discord.js";
import { TicketService } from "@robo/db";
import { InteractionUtils } from "@/lib/interactionUtils";
import { TicketActionServices } from "@/Permissions/roles";

export const renameTicket = async (
    interaction: Interaction,
    channelId: string | undefined,
    services: TicketActionServices
) => {
   await InteractionUtils.safeReply(
        interaction,
        "⏳ This action requires additional input. A prompt will follow.",
    );
};
