import { ButtonType } from ".";
import { closeTicket, reopenTicket, deleteTicket, claimTicket, manageTicket, addMember, removeMember, renameTicket, transferTicket, transcriptTicket } from "./actions";
import { Interaction } from "discord.js";
import { TicketService } from "@robo/db";

// Define the services available to actions
export interface TicketActionServices {
    db: TicketService;
}

// Define the function signature for actions
export type TicketActionFunction = (
    interaction: Interaction, 
    channelId: string | undefined, 
    services: TicketActionServices
) => Promise<void | any>;

// Map each button type to its corresponding action function
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
