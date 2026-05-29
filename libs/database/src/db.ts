import { PrismaClient } from "../generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma =
    new PrismaClient({
        log: ["error", "warn"],
    }).$extends(withAccelerate())

// --- Services Exports ---
import { GuildService } from "./services/guild.repository";
import { TicketRepository } from "./services/ticket.repository";
import { PanelService } from "./services/panel.repository";
import { FormService } from "./services/form.repository";
import { PermissionService } from "./services/permission.repository";

// --- Types Export ---
import { Guild, TicketPanel, Ticket, Panel, FormData, Question, Permission } from "../generated/prisma";

// --- Default Export ---
import {DefaultPermissions} from "./default/persmession"

// --- Main Exports ---
export {
    GuildService,
    TicketRepository,
    PanelService,
    FormService,
    PermissionService,
    DefaultPermissions,
    type Guild,
    type TicketPanel,
    type Ticket,
    type Panel,
    type FormData,
    type Question,
    type Permission,
    prisma
};
