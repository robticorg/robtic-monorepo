import { COMMAND_WORDS, TICKET_COMMANDS, type TicketCommand, type TicketSettings } from "@robo/shared";

// Typed commands: the server's prefix, then one of the command's words (Commands page; they start as the English and
// Arabic names, !close, !اغلاق…), then its argument.

const BUILT_IN = new Map<string, TicketCommand>();
for (const c of TICKET_COMMANDS) {
    const w = COMMAND_WORDS[c];
    if (!w) continue;
    BUILT_IN.set(w.en, c);
    for (const ar of w.ar) BUILT_IN.set(ar, c);
}

export interface ParsedCommand {
    command: TicketCommand;
    /** Turned off on the Commands page. */
    enabled: boolean;
    /** Everything after the command word (the reason, the new name, a mention). */
    rest: string;
}

export function parseCommand(content: string, prefix: string, commands?: TicketSettings["commands"]): ParsedCommand | null {
    if (!prefix || !content.startsWith(prefix)) return null;
    const body = content.slice(prefix.length).trim();
    const [raw = "", ...rest] = body.split(/\s+/);
    const word = raw.toLowerCase();
    // The server's list (Commands page) is the whole set of words once saved that way: a removed name stops working.
    // Without settings (or an old document), the built-in English and Arabic names.
    const own = (c: TicketCommand) => commands?.[c]?.words === true;
    let command = TICKET_COMMANDS.find((c) => own(c) && commands![c].aliases.some((a) => a.toLowerCase() === word));
    if (!command) {
        const built = BUILT_IN.get(word);
        if (built && !own(built)) command = built;
    }
    if (!command && commands) command = TICKET_COMMANDS.find((c) => !own(c) && commands[c]?.aliases.some((a) => a.toLowerCase() === word));
    if (!command) return null;
    return { command, enabled: commands?.[command]?.enabled !== false, rest: rest.join(" ").trim() };
}

/** The first member mentioned (or a bare id). */
export const mentionedId = (text: string) => /<@!?(\d{15,22})>|^(\d{15,22})$/.exec(text.trim())?.slice(1).find(Boolean) ?? null;
