import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { prisma } from "@robo/db";
import { InteractionUtils } from "@/lib/interactionUtils";

export default {
    data: new SlashCommandBuilder()
        .setName("create-new-ticket")
        .setDescription("only for create test panel"),

    run: async (interaction: ChatInputCommandInteraction) => {
        InteractionUtils.safeDefer(interaction, true);
        
        await prisma.formData.create({
            data: {
                id: "test-fomr-2",
                name: "Mounir",
                questions: {
                    create: [
                        {
                            id: "ques-1",
                            name: "What is your favorite color?",
                            style: "SHORT",
                            required: true,
                            placeholder: "e.g., Blue"
                        },
                        {
                            id: "ques-2",
                            name: "fdsfdsfds",
                            style: "PARAGRAPH",
                            required: false,
                            placeholder: "e.g., Blue"
                        },
                    ]
                }
            }
        });
        // 2. Create TicketPanel linked to Panel
        await prisma.ticketPanel.create({
            data: {
                panelId: "test",
                name: "test form 2",
                style: "2",
                hasForm: true,
                formId: "test-fomr-2",
                channels: {
                    category: "1445469073315201148"
                }
            }
        });

        // 3. Create Form + Questions

        InteractionUtils.safeReply(
            interaction,
            `Panel created for guild: ${interaction.guildId} 🎉`
        );
    }
};
