import { PrismaClient } from "../generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";
const prisma = new PrismaClient({
    log: ["error", "warn"],
}).$extends(withAccelerate());
// --- Services Exports ---
import { GuildService } from "./services/guild.service";
import { TicketService } from "./services/ticket.service";
import { PanelService } from "./services/panel.service";
import { FormService } from "./services/form.service";
// --- Main Exports ---
export { GuildService, TicketService, PanelService, FormService, prisma };
