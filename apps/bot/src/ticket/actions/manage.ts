import type { APIModalInteractionResponseCallbackData, GuildMember, TextChannel } from "discord.js";
import { PAGE_ACTIONS, resolveLifecycle, t, type TicketAction } from "@robo/shared";
import { check, type Result } from "..";
import type { TicketContext } from "../types";
import { contextOf } from "../utils";
import { renderMessage, type Payload } from "@/lib/messagePayload";
import { varsOf } from "../TicketEmbed";

// One control, however it was asked for: a button, the controls menu, a slash command or a typed command. Each action
// file gets the same "invocation": who, where, how to answer, and (for commands) its arguments. Buttons ask for what
// they need with a popup (rename, close reason, the member to add / remove / hand over) and, when the option says so,
// an "are you sure?" first (Close, Delete).

export interface Invocation {
    channel: TextChannel;
    member: GuildMember;
    /** Answers the person (privately for buttons and slash commands, in the channel for typed commands). */
    reply: (text: string, files?: Result["files"]) => Promise<void>;
    /** Posts in the ticket for everyone (what changed). */
    announce: (message: string | Payload) => Promise<void>;
    /** Buttons and menus can open a popup; commands cannot. */
    showModal?: (modal: APIModalInteractionResponseCallbackData) => Promise<void>;
    /** Buttons and menus can ask "are you sure?" with a Yes button. */
    confirm?: (action: TicketAction, question: string | Payload) => Promise<void>;
    args: { reason?: string | null; name?: string | null; target?: GuildMember | null; confirmed?: boolean };
}

export type ActionFn = (inv: Invocation, ctx: TicketContext) => Promise<void>;

/** Answers with the result: in the channel when something changed for everyone, else only to the person. */
export async function finish(inv: Invocation, r: Result) {
    if (r.ok) {
        if (r.payload) await inv.announce(r.payload);
        else if (r.text) await inv.announce(r.text);
        await inv.reply("✅", r.files);
    } else await inv.reply(r.text, r.files);
}

/** Asks first when the option wants a confirmation and this came from a button (commands are deliberate already). */
export async function askFirst(inv: Invocation, ctx: TicketContext, action: "close" | "delete"): Promise<boolean> {
    if (inv.args.confirmed || !inv.confirm || !ctx.option?.controls.items[action].confirm) return false;
    // A designed confirmation (embed or components) when the control has one.
    const item = ctx.option?.controls.items[action];
    if (item?.confirmStyle === "design") {
        await inv.confirm(action, renderMessage(item.confirmDesign, await varsOf(inv.channel.guild, ctx), [], { users: [], roles: [] }));
        return true;
    }
    // Close: the dashboard's own wording when it has one (the option's, else the server's).
    const custom = action === "close" ? resolveLifecycle(ctx.settings.general, ctx.option).closeConfirm.trim() : "";
    await inv.confirm(action, custom || t(ctx.settings.general.language, action === "close" ? "confirm.close" : "confirm.delete"));
    return true;
}

/** Runs a control in a ticket channel after the shared checks (who may, and the state allows it). */
export async function runControl(action: TicketAction, inv: Invocation, actions: Record<TicketAction, ActionFn>) {
    const ctx = await contextOf(inv.channel.guild.id, inv.channel.id);
    if (!ctx) return inv.reply(t("en", "notTicket"));
    // Come and Sleep (buttons or menu entries): their pages say who may use them, and they check it themselves.
    if (PAGE_ACTIONS.includes(action)) return actions[action](inv, ctx);
    const denied = check(inv.member, ctx, action);
    if (denied) return inv.reply(denied.text);
    await actions[action](inv, ctx);
}
