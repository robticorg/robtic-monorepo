import type { ButtonType } from "./buttons";
import { closeTicket, reopenTicket, deleteTicket, claimTicket, manageTicket, addMember, removeMember, renameTicket, transferTicket, transcriptTicket } from "../ticket/actions";
import { Interaction } from "discord.js";
import { TicketRepository } from "@robo/db";

export interface TicketActionServices {
    db: TicketRepository;
}

export type TicketActionFunction = (
    interaction: Interaction, 
    channelId: string | undefined, 
    services: TicketActionServices
) => Promise<void | any>;

export const TicketRoles: Record<ButtonType, TicketActionFunction> = {
    close: closeTicket,
    reopen: reopenTicket,
    delete: deleteTicket,
    claim: claimTicket,
    manage: manageTicket,
    add: addMember,
    remove: removeMember,
    rename: renameTicket,
    transfer: transferTicket,
    transcript: transcriptTicket,
};
