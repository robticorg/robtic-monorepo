import { Events, Interaction } from "discord.js";
import { FormService, TicketService } from "@robo/db";
import { Ticket, Modal } from "@/components/_class";
import { InteractionUtils } from "@/lib/interactionUtils";
import TicektAccess from "@/utils/interaction/ticektAccess";
import { Logger } from "@robo/logger";

const ticket = new Ticket(new TicketService());
const modal = new Modal();
const ticketData = new TicketService();
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

            const found = await ticketData.panelFind(ticketId);
            if (!found) return;

            if (await TicektAccess(interaction, found.id)) {
                await InteractionUtils.safeDefer(interaction);
                await InteractionUtils.safeReply(interaction, "❌ you already have a ticket open");
                return;
            }

            if (found.hasForm && found.formId) {
                const formFound = await formData.find(found.formId);
                if (formFound) {
                    return modal.create(interaction, formFound);
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