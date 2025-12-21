export declare class FormService {
    create(): Promise<void>;
    find(id: string): Promise<({
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
        questions: {
            id: string;
            name: string;
            placeholder: string | null;
            style: string;
            formId: string;
            required: boolean;
            minLength: number | null;
            maxLength: number | null;
        }[];
    } & {
        id: string;
        name: string;
    }) | null>;
}
