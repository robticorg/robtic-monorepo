import type { TicketAction, TicketOption, TicketPanel, TicketSettings } from "@robo/shared";
import type { TicketDoc } from "@robo/db";

// The ids the bot puts on buttons, menus and popups (Discord sends them back on every click). Short: Discord allows 100
// characters, panel and option ids are about 12.
export const IDS = {
    /** A panel's button: open a ticket of this option. */
    open: (panelId: string, optionId: string) => `tk:o:${panelId}:${optionId}`,
    /** A panel's menu: the picked value is the option id. */
    menu: (panelId: string) => `tk:m:${panelId}`,
    /** The questions popup before a ticket opens. */
    form: (panelId: string, optionId: string) => `tk:f:${panelId}:${optionId}`,
    /** A ticket control button (Close, Claim…). */
    control: (action: TicketAction) => `tk:c:${action}`,
    /** The ticket controls as a menu: the picked value is the action. */
    controlMenu: "tk:cm",
    closeReason: "tk:close",
    rename: "tk:rename",
    /** The member picker popup for add / remove / transfer. */
    memberForm: (what: "add" | "remove" | "transfer") => `tk:mm:${what}`,
    /** "Yes" on an "are you sure?" for Close or Delete. */
    confirm: (action: TicketAction) => `tk:y:${action}`,
} as const;

export const PREFIX = "tk:";

/** Everything about one ticket channel: the ticket, its server's settings, and the panel and option it came from. */
export interface TicketContext {
    ticket: TicketDoc;
    settings: TicketSettings;
    panel: TicketPanel | null;
    option: TicketOption | null;
}
