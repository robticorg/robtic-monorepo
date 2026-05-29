import { Events, Interaction } from "discord.js";
import { InteractionUtils } from "@/lib/interactionUtils";
import { FormService, TicketRepository } from "@robo/db";
import { Logger } from "@robo/logger";
import { TicketServices } from "..";
import { TicketAuditService } from "../TicketAuditService";
import { TicketDiscordAdapter } from "../TicketDiscordAdapter";
import { TicketStateMachine } from "../TicketState";

interface valueProps {
    label: string;
    value: string;
}

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
        if (!interaction.isModalSubmit()) return;
        await InteractionUtils.safeDefer(interaction);

        try {
            const found = await formData.find(interaction.customId);
            if (!found) {
                return InteractionUtils.safeReply(
                    interaction,
                    "❌ Error: Unknown form submitted.",
                );
            }

            const matchingPanel = found.ticketPanels.find(tp => tp.formId === found.id);
            if (!matchingPanel) {
                return InteractionUtils.safeReply(
                    interaction,
                    "❌ Error: Missing ticket data for this form.",
                );
            }

            const dataFound = await ticketRepo.panelFind(matchingPanel.id);
            if (!dataFound) {
                return InteractionUtils.safeReply(
                    interaction,
                    "❌ Error: Missing ticket data for this form.",
                );
            }

            const values: valueProps[] = [];
            for (const question of found.questions) {
                values.push({
                    label: question.name,
                    value: interaction.fields.getTextInputValue(question.id),
                });
            }

            await ticket.create(interaction, dataFound);

            Logger.debug(`[ModalHandler] Form submitted with ${values.length} answers`);
        } catch (err) {
            Logger.error("[ModalHandler]", err);
            await InteractionUtils.safeReply(
                interaction,
                "❌ Failed to process this form. Please try again.",
            );
        }
    },
};