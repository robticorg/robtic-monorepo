import type { APIMessageComponentEmoji } from "discord.js";
import type { MessageDesign, PanelEmbed, TicketButtonStyle } from "@robo/shared";

// A message designed on the dashboard, as Discord wants it: a classic embed (with optional text above) or a Components
// V2 container. Its interactive part, the "slot" (the panel's ticket options or a ticket's controls), is passed in as
// ready action rows. Pictures uploaded on the dashboard arrive as data URLs: they go up as attachments.

const IS_COMPONENTS_V2 = 1 << 15;
const STYLE: Record<TicketButtonStyle, number> = { primary: 1, secondary: 2, success: 3, danger: 4 };

export type Vars = Record<string, string>;
export type Row = { type: 1; components: Record<string, unknown>[] };
export interface Payload {
    content?: string;
    embeds?: Record<string, unknown>[];
    components: Record<string, unknown>[];
    flags?: number;
    files?: { attachment: Buffer; name: string }[];
    allowedMentions?: { parse?: ("users" | "roles" | "everyone")[]; users?: string[]; roles?: string[] };
}

/** `{user}` → its value; unknown words stay as they are. */
export const fill = (text: string, vars: Vars) => text.replace(/\{(\w+)\}/g, (m, k: string) => vars[k] ?? m);

/** A button's or option's emoji: a server emoji `<:name:id>` / `<a:name:id>`, or plain unicode. */
export function emojiOf(text: string | undefined | null): APIMessageComponentEmoji | undefined {
    const v = text?.trim();
    if (!v) return undefined;
    const custom = /^<(a?):(\w{2,32}):(\d{15,22})>$/.exec(v);
    if (custom) return { id: custom[3], name: custom[2], animated: custom[1] === "a" };
    return { name: v };
}

export function button(customId: string, label: string, emoji: string, style: TicketButtonStyle, disabled = false): Record<string, unknown> {
    const e = emojiOf(emoji);
    return { type: 2, style: STYLE[style], custom_id: customId, ...(label.trim() ? { label: label.trim().slice(0, 80) } : {}), ...(e ? { emoji: e } : {}), disabled };
}

/** Up to 5 buttons per row. */
export function buttonRows(buttons: Record<string, unknown>[]): Row[] {
    const rows: Row[] = [];
    for (let i = 0; i < buttons.length; i += 5) rows.push({ type: 1, components: buttons.slice(i, i + 5) });
    return rows;
}

export function menuRow(customId: string, placeholder: string, options: { label: string; value: string; description?: string; emoji?: string }[]): Row {
    return {
        type: 1,
        components: [{
            type: 3,
            custom_id: customId,
            ...(placeholder.trim() ? { placeholder: placeholder.trim().slice(0, 150) } : {}),
            options: options.slice(0, 25).map((o) => {
                const e = emojiOf(o.emoji);
                return {
                    label: (o.label.trim() || "Option").slice(0, 100),
                    value: o.value,
                    ...(o.description?.trim() ? { description: o.description.trim().slice(0, 100) } : {}),
                    ...(e ? { emoji: e } : {}),
                };
            }),
        }],
    };
}

/** One entry of a message's interactive part: drawn as a button, or as an option of the message's one menu. */
export interface SlotItem {
    placement: "button" | "menu";
    button: Record<string, unknown>;
    option: { label: string; value: string; description?: string; emoji?: string };
}

/** Buttons first (rows of 5; 20 at most when there's a menu, Discord allows 5 rows), then one menu with the rest. */
export function slotRows(items: readonly SlotItem[], menuId: string, placeholder: string): Row[] {
    const menu = items.filter((i) => i.placement === "menu").map((i) => i.option);
    const rows = buttonRows(items.filter((i) => i.placement === "button").map((i) => i.button).slice(0, menu.length ? 20 : 25));
    if (menu.length) rows.push(menuRow(menuId, placeholder, menu));
    return rows;
}

/** Uploaded pictures (data URLs) become attachments; https links are used as they are. */
class Files {
    readonly list: { attachment: Buffer; name: string }[] = [];
    url(value: string): string {
        const m = /^data:image\/(png|jpe?g|gif|webp);base64,(.+)$/s.exec(value);
        if (!m) return value;
        const name = `image-${this.list.length + 1}.${m[1] === "jpeg" ? "jpg" : m[1]}`;
        this.list.push({ attachment: Buffer.from(m[2]!, "base64"), name });
        return `attachment://${name}`;
    }
}

const hex = (c: string | null) => (c ? parseInt(c.slice(1), 16) : undefined);

function embedJson(e: PanelEmbed, vars: Vars, files: Files): Record<string, unknown> {
    return {
        ...(e.title.trim() ? { title: fill(e.title, vars).slice(0, 256) } : {}),
        ...(e.url ? { url: e.url } : {}),
        ...(e.description.trim() ? { description: fill(e.description, vars).slice(0, 4096) } : {}),
        ...(hex(e.color) !== undefined ? { color: hex(e.color) } : {}),
        ...(e.author.trim() ? { author: { name: fill(e.author, vars).slice(0, 256) } } : {}),
        ...(e.fields.length ? { fields: e.fields.slice(0, 25).map((f) => ({ name: fill(f.name, vars) || "​", value: fill(f.value, vars) || "​", inline: f.inline })) } : {}),
        ...(e.thumbnail ? { thumbnail: { url: files.url(e.thumbnail) } } : {}),
        ...(e.image ? { image: { url: files.url(e.image) } } : {}),
        ...(e.footer.trim() ? { footer: { text: fill(e.footer, vars).slice(0, 2048) } } : {}),
    };
}

/** The whole message. `slot` is the interactive rows; `mentions` lists who may actually be pinged. */
export function renderMessage(m: MessageDesign, vars: Vars, slot: Row[], mentions: Payload["allowedMentions"] = { parse: [] }): Payload {
    const files = new Files();
    if (m.format === "components") {
        const children: Record<string, unknown>[] = [];
        for (const b of m.blocks) {
            if (b.type === "text" && b.content.trim()) children.push({ type: 10, content: fill(b.content, vars) });
            else if (b.type === "image" && b.url) children.push({ type: 12, items: [{ media: { url: files.url(b.url) } }] });
            else if (b.type === "thumbText" && b.content.trim()) {
                children.push(b.thumbnail
                    ? { type: 9, components: [{ type: 10, content: fill(b.content, vars) }], accessory: { type: 11, media: { url: files.url(b.thumbnail) } } }
                    : { type: 10, content: fill(b.content, vars) });
            } else if (b.type === "separator") children.push({ type: 14, divider: b.divider, spacing: b.spacing });
            else if (b.type === "slot") children.push(...slot);
        }
        if (!m.blocks.some((b) => b.type === "slot")) children.push(...slot);
        return {
            components: [{ type: 17, ...(hex(m.accent) !== undefined ? { accent_color: hex(m.accent) } : {}), components: children }],
            flags: IS_COMPONENTS_V2,
            files: files.list,
            allowedMentions: mentions,
        };
    }
    const content = m.content.trim() ? fill(m.content, vars).slice(0, 2000) : undefined;
    return { ...(content ? { content } : {}), embeds: [embedJson(m.embed, vars, files)], components: slot, files: files.list, allowedMentions: mentions };
}

/** A plain one-line notice (the bot's own replies), optionally with rows. */
export const notice = (text: string, rows: Row[] = []): Payload => ({ content: text, components: rows, allowedMentions: { parse: [] } });

/** A short embed notice in a colour (closed / reopened cards). */
export const card = (title: string, text: string, color: number, rows: Row[] = []): Payload => ({
    embeds: [{ title, description: text, color }],
    components: rows,
    allowedMentions: { parse: [] },
});
