import { COMMAND_WORDS, TICKET_COMMANDS, type TicketCommand, type TicketSettings } from "@robo/shared";

// Typed commands: the server's prefix, then the command in English or Arabic (!close, !اغلاق…) or one of the server's
// extra words for it (Commands page), then its argument.

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
    let command = BUILT_IN.get(word);
    if (!command && commands) command = TICKET_COMMANDS.find((c) => commands[c]?.aliases.some((a) => a.toLowerCase() === word));
    if (!command) return null;
    return { command, enabled: commands?.[command]?.enabled !== false, rest: rest.join(" ").trim() };
}

/** The first member mentioned (or a bare id). */
export const mentionedId = (text: string) => /<@!?(\d{15,22})>|^(\d{15,22})$/.exec(text.trim())?.slice(1).find(Boolean) ?? null;
