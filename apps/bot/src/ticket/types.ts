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
    /** An info button (on a panel or among a ticket's controls): shows that info panel. The item id keeps ids unique. */
    info: (infoPanelId: string, itemId: string) => `tk:v:${infoPanelId}:${itemId}`,
    /** An info button placed in a menu: the picked value. */
    infoValue: (infoPanelId: string, itemId: string) => `v:${infoPanelId}:${itemId}`,
    /** A button or menu inside an info panel. */
    infoItem: (panelId: string, itemId: string) => `tk:x:${panelId}:${itemId}`,
} as const;

/** The info panel an info button's menu value points at (`v:<panelId>:<itemId>`), if it is one. */
export const infoPanelOf = (value: string) => (value.startsWith("v:") ? value.split(":")[1] ?? null : null);

export const PREFIX = "tk:";

/** Everything about one ticket channel: the ticket, its server's settings, and the panel and option it came from. */
export interface TicketContext {
    ticket: TicketDoc;
    settings: TicketSettings;
    panel: TicketPanel | null;
    option: TicketOption | null;
}
