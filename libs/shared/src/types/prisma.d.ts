import type { Panel, Ticket, TicketPanel, FormData, Question } from "@robo/db";
import { TicketStatus } from "./ticket";

export interface PanelProps extends Panel {
    ticketPanels?: TicketPanel[];
}

export interface TicketProps {
    id: string;
    panelId: string;
    name: string;
    description: string | null;
    emoji: string | null;
    style: string;
    hasForm: boolean;
    maintenance: boolean;
    status: Boolean;
    formId: string | null;
    channels: unknown | null;
    tickets?: Ticket[];
}

export type TicketUpdate = Omit<TicketProps, "id" | "panelId">;

export interface FormDataProps extends Pick<FormData, "id" | "name"> {
    questions?: Question[];
    ticketPanels?: TicketPanel[];
}
