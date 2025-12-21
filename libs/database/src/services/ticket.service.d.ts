import { prisma } from "@robo/db";
import { ticketBy } from "@robo/shared";
type TicketUpdateData = Parameters<typeof prisma.ticket.update>[0]['data'];
export declare class TicketService {
    create(id: string, userId: string, panelId: string): Promise<void>;
    find(by: ticketBy | undefined, id: string): Promise<({
        panel: {
            id: string;
            name: string;
            createdAt: Date;
            data: import("libs/database/generated/prisma/runtime/library").JsonValue | null;
            description: string | null;
            panelId: string;
            emoji: string | null;
            style: string;
            hasForm: boolean;
            maintenance: boolean;
            status: boolean;
            formId: string | null;
            channels: import("libs/database/generated/prisma/runtime/library").JsonValue | null;
        };
    } & {
        id: string;
        embed: import("libs/database/generated/prisma/runtime/library").JsonValue | null;
        createdAt: Date;
        data: import("libs/database/generated/prisma/runtime/library").JsonValue | null;
        panelId: string;
        status: import("libs/database/generated/prisma").$Enums.TicketStatus;
        userId: string | null;
        claimer: string | null;
    }) | null | undefined>;
    update(id: string, data: TicketUpdateData): Promise<{
        id: string;
        embed: import("libs/database/generated/prisma/runtime/library").JsonValue | null;
        createdAt: Date;
        data: import("libs/database/generated/prisma/runtime/library").JsonValue | null;
        panelId: string;
        status: import("libs/database/generated/prisma").$Enums.TicketStatus;
        userId: string | null;
        claimer: string | null;
    } | undefined>;
    delete(id: string): Promise<void>;
    panelCreate(panelId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        data: import("libs/database/generated/prisma/runtime/library").JsonValue | null;
        description: string | null;
        panelId: string;
        emoji: string | null;
        style: string;
        hasForm: boolean;
        maintenance: boolean;
        status: boolean;
        formId: string | null;
        channels: import("libs/database/generated/prisma/runtime/library").JsonValue | null;
    } | undefined>;
    panelFind(ticketPanelId: string): Promise<({
        panel: {
            id: string;
            guildId: string;
            name: string;
            type: import("libs/database/generated/prisma").$Enums.PanelType;
            placeholder: string | null;
            templateId: string | null;
            embed: import("libs/database/generated/prisma/runtime/library").JsonValue | null;
            createdAt: Date;
        };
        form: {
            id: string;
            name: string;
        } | null;
    } & {
        id: string;
        name: string;
        createdAt: Date;
        data: import("libs/database/generated/prisma/runtime/library").JsonValue | null;
        description: string | null;
        panelId: string;
        emoji: string | null;
        style: string;
        hasForm: boolean;
        maintenance: boolean;
        status: boolean;
        formId: string | null;
        channels: import("libs/database/generated/prisma/runtime/library").JsonValue | null;
    }) | null | undefined>;
    findUserTicketInPanel(userId: string, panelId: string): Promise<({
        panel: {
            id: string;
            name: string;
            createdAt: Date;
            data: import("libs/database/generated/prisma/runtime/library").JsonValue | null;
            description: string | null;
            panelId: string;
            emoji: string | null;
            style: string;
            hasForm: boolean;
            maintenance: boolean;
            status: boolean;
            formId: string | null;
            channels: import("libs/database/generated/prisma/runtime/library").JsonValue | null;
        };
    } & {
        id: string;
        embed: import("libs/database/generated/prisma/runtime/library").JsonValue | null;
        createdAt: Date;
        data: import("libs/database/generated/prisma/runtime/library").JsonValue | null;
        panelId: string;
        status: import("libs/database/generated/prisma").$Enums.TicketStatus;
        userId: string | null;
        claimer: string | null;
    }) | null | undefined>;
}
export {};
