import { PrismaClient } from "../generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma =
    new PrismaClient({
        log: ["error", "warn"],
    }).$extends(withAccelerate())

// --- Services Exports ---
import { GuildService } from "./services/guild.service";
import { TicketService } from "./services/ticket.service";
import { PanelService } from "./services/panel.service";
import { FormService } from "./services/form.service";
import { PermissionService } from "./services/permission.service";

// --- Types Export ---
import { Guild, TicketPanel, Ticket, Panel, FormData, Permission } from "../generated/prisma";

// --- Default Export ---
import {DefaultPermissions} from "./default/persmession"

// --- Main Exports ---
export {
    GuildService,
    TicketService,
    PanelService,
    FormService,
    PermissionService,
    DefaultPermissions,
    type Guild,
    type TicketPanel,
    type Ticket,
    type Panel,
    type FormData,
    type Permission,
    prisma
};