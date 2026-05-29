import { Events, Interaction } from "discord.js";
import { FormService, TicketRepository } from "@robo/db";
import { InteractionUtils } from "@/lib/interactionUtils";
import TicektAccess from "@/utils/interaction/ticektAccess";
import { Logger } from "@robo/logger";
import { TicketAuditService, TicketDiscordAdapter, TicketServices, TicketStateMachine } from "..";
import { createModal } from "../TicketModalCreate";

const ticketRepo = new TicketRepository();
const ticket = new TicketServices(
    ticketRepo, 
    new TicketStateMachine, 
    new TicketAuditService, 
    new TicketDiscordAdapter 
);
const formData = new FormService();

export default {
    name: Events.InteractionCreate,

    run: async (interaction: Interaction) => {
        if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;

        try {
            const checkIsTicket = interaction.isButton()
                ? interaction.customId.startsWith("ticket_")
                : interaction.customId.startsWith("menu_");

            if (!checkIsTicket) return;

            const ticketId = interaction.isButton()
                ? interaction.customId.replace("ticket_", "")
                : interaction.values[0];

            const found = await ticketRepo.panelFind(ticketId);
            if (!found) return;

            if (await TicektAccess(interaction, found.id)) {
                await InteractionUtils.safeDefer(interaction);
                await InteractionUtils.safeReply(interaction, "❌ you already have a ticket open");
                return;
            }

            if (found.hasForm && found.formId) {
                const formFound = await formData.find(found.formId);
                if (formFound) {
                    return createModal(interaction, found)
                }
            }

            await InteractionUtils.safeDefer(interaction);

            return ticket.create(interaction, found);
        } catch (err) {
            Logger.error("[TicketHandler]", err);
            await InteractionUtils.safeReply(
                interaction,
                "❌ Failed to process this interaction. Please try again.",
            );
        }
    },
};