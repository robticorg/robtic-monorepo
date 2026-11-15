import { PREFIX } from "../types";

/** Whether a button, menu or popup belongs to Robtic Ticket (every id starts with `tk:`). */
export const isTicketId = (customId: string) => customId.startsWith(PREFIX);
