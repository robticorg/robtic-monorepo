export declare class PanelService {
    create(guildId: string, name: string): Promise<{
        id: string;
        guildId: string;
        name: string;
        type: import("libs/database/generated/prisma").$Enums.PanelType;
        placeholder: string | null;
        templateId: string | null;
        embed: import("libs/database/generated/prisma/runtime/library").JsonValue | null;
        createdAt: Date;
    } | undefined>;
    find(panelId: string): Promise<({
        ticketPanels: {
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
        }[];
    } & {
        id: string;
        guildId: string;
        name: string;
        type: import("libs/database/generated/prisma").$Enums.PanelType;
        placeholder: string | null;
        templateId: string | null;
        embed: import("libs/database/generated/prisma/runtime/library").JsonValue | null;
        createdAt: Date;
    }) | null>;
}
