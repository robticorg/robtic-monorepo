import { MessageFlags, type ButtonInteraction, type GuildMember, type StringSelectMenuInteraction } from "discord.js";
import { Logger } from "@robo/logger";
import { SettingsRepository } from "@robo/db";
import type { MediaItem, Panel, PanelAction, PanelBlock, PanelButton, PanelOption, PanelSelect, TicketLanguage } from "@robo/shared";
import { emojiOf, type Payload } from "@/lib/messagePayload";
import { IDS } from "./types";

// Info panels (the dashboard's Info panels page, Robtic System's panel builder): shown to whoever presses an info button
// (only them), or posted in a channel. Their own buttons and menu options reply, give or take a role, or open another
// info panel: custom ids `tk:x:<panelId>:<buttonId>` and `tk:x:<panelId>:<menuId>` (the picked value is the option id).

const settings = new SettingsRepository();
const IS_COMPONENTS_V2 = 1 << 15;
const STYLE = { primary: 1, secondary: 2, success: 3, danger: 4, link: 5 } as const;

const L = (lang: TicketLanguage, en: string, ar: string) => (lang === "ar" ? ar : en);

/** Uploaded pictures (data URLs) become attachments; https links are used as they are. */
class Files {
    readonly list: { attachment: Buffer; name: string }[] = [];
    url(value: string): string {
        const m = /^data:image\/(png|jpe?g|gif|webp);base64,(.+)$/s.exec(value);
        if (!m) return value;
        const name = `info-${this.list.length + 1}.${m[1] === "jpeg" ? "jpg" : m[1]}`;
        this.list.push({ attachment: Buffer.from(m[2]!, "base64"), name });
        return `attachment://${name}`;
    }
}

function buttonJson(panelId: string, b: PanelButton): Record<string, unknown> {
    const e = emojiOf(b.emoji);
    const look = { ...(b.label.trim() ? { label: b.label.trim().slice(0, 80) } : {}), ...(e ? { emoji: e } : {}) };
    if (b.style === "link") return { type: 2, style: STYLE.link, url: b.url, ...look };
    return { type: 2, style: STYLE[b.style], custom_id: IDS.infoItem(panelId, b.id), ...look };
}

function selectJson(panelId: string, s: PanelSelect): Record<string, unknown> {
    return {
        type: 1,
        components: [{
            type: 3,
            custom_id: IDS.infoItem(panelId, s.id),
            ...(s.placeholder.trim() ? { placeholder: s.placeholder.trim().slice(0, 150) } : {}),
            options: s.options.slice(0, 25).map((o) => {
                const e = emojiOf(o.emoji);
                return { label: (o.label.trim() || "Option").slice(0, 100), value: o.id, ...(o.description.trim() ? { description: o.description.trim().slice(0, 100) } : {}), ...(e ? { emoji: e } : {}) };
            }),
        }],
    };
}

const media = (m: MediaItem, files: Files) => ({ media: { url: files.url(m.url) }, ...(m.description.trim() ? { description: m.description.trim().slice(0, 1024) } : {}), spoiler: m.spoiler });

function blocksJson(panelId: string, blocks: readonly PanelBlock[], files: Files): Record<string, unknown>[] {
    return blocks.flatMap((b): Record<string, unknown>[] => {
        switch (b.type) {
            case "text": return b.content.trim() ? [{ type: 10, content: b.content }] : [];
            case "section": return [{
                type: 9,
                components: b.texts.filter((t) => t.trim()).map((t) => ({ type: 10, content: t })),
                accessory: b.accessory.kind === "thumbnail" ? { type: 11, ...media(b.accessory.media, files) } : buttonJson(panelId, b.accessory.button),
            }];
            case "gallery": return [{ type: 12, items: b.items.map((m) => media(m, files)) }];
            case "separator": return [{ type: 14, divider: b.divider, spacing: b.spacing }];
            case "buttons": return [{ type: 1, components: b.buttons.slice(0, 5).map((x) => buttonJson(panelId, x)) }];
            case "select": return [selectJson(panelId, b.select)];
            case "container": return [{
                type: 17,
                ...(b.accent ? { accent_color: parseInt(b.accent.slice(1), 16) } : {}),
                spoiler: b.spoiler,
                components: blocksJson(panelId, b.children, files),
            }];
            default: return [];
        }
    });
}

/** An info panel as a Discord message; `ephemeral`: only the member who pressed sees it. */
export function infoPanelPayload(p: Panel, ephemeral: boolean): Payload {
    const files = new Files();
    const hidden = ephemeral ? MessageFlags.Ephemeral : 0;
    if (p.format === "components") {
        return { components: blocksJson(p.id, p.blocks, files), flags: IS_COMPONENTS_V2 | hidden, files: files.list, allowedMentions: { parse: [] } };
    }
    const e = p.embed;
    const embed: Record<string, unknown> = {
        ...(e.title.trim() ? { title: e.title.slice(0, 256) } : {}),
        ...(e.url ? { url: e.url } : {}),
        ...(e.description.trim() ? { description: e.description.slice(0, 4096) } : {}),
        ...(e.color ? { color: parseInt(e.color.slice(1), 16) } : {}),
        ...(e.author.trim() ? { author: { name: e.author.trim().slice(0, 256) } } : {}),
        ...(e.fields.length ? { fields: e.fields.slice(0, 25).map((f) => ({ name: f.name || "​", value: f.value || "​", inline: f.inline })) } : {}),
        ...(e.thumbnail ? { thumbnail: { url: files.url(e.thumbnail) } } : {}),
        ...(e.image ? { image: { url: files.url(e.image) } } : {}),
        ...(e.footer.trim() ? { footer: { text: e.footer.trim().slice(0, 2048) } } : {}),
    };
    const components = p.rows.flatMap((r) => (r.type === "buttons" ? [{ type: 1, components: r.buttons.slice(0, 5).map((x) => buttonJson(p.id, x)) }] : r.type === "select" ? [selectJson(p.id, r.select)] : []));
    return { embeds: [embed], components, ...(hidden ? { flags: hidden } : {}), files: files.list, allowedMentions: { parse: [] } };
}

type Click = ButtonInteraction<"cached"> | StringSelectMenuInteraction<"cached">;

/** Shows an info panel to the member who pressed. From an info panel already shown only to them, it replaces it. */
export async function showInfoPanel(interaction: Click, infoPanelId: string): Promise<void> {
    const s = await settings.get(interaction.guildId);
    const lang = s.general.language;
    const panel = s.infoPanels.find((p) => p.id === infoPanelId);
    if (!panel) {
        await interaction.reply({ content: L(lang, "This information is no longer available.", "هذه المعلومات لم تعد متاحة."), flags: MessageFlags.Ephemeral });
        return;
    }
    const payload = infoPanelPayload(panel, true);
    if (interaction.message.flags.has(MessageFlags.Ephemeral)) {
        // Replacing a message: drop the old pictures; a switch between embed and components needs a fresh reply.
        const sameKind = interaction.message.flags.has(MessageFlags.IsComponentsV2) === (panel.format === "components");
        if (sameKind) {
            const { flags: _f, ...rest } = payload;
            await interaction.update({ ...rest, ...(panel.format === "embed" ? { content: null } : {}), attachments: [] } as never);
            return;
        }
    }
    await interaction.reply(payload as never);
}

/** Every button, menu and option in a panel, wherever it sits (rows, sections, containers). */
function collect(node: unknown, out: (PanelButton | PanelSelect | PanelOption)[]): void {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) { node.forEach((n) => collect(n, out)); return; }
    const o = node as Record<string, unknown>;
    if (typeof o.id === "string" && ("action" in o || "options" in o)) out.push(o as unknown as PanelButton);
    for (const v of Object.values(o)) if (v && typeof v === "object") collect(v, out);
}

/** A button or menu option inside an info panel was used. */
export async function infoPanelClick(interaction: Click, panelId: string, itemId: string): Promise<void> {
    const s = await settings.get(interaction.guildId);
    const lang = s.general.language;
    const panel = s.infoPanels.find((p) => p.id === panelId);
    const all: (PanelButton | PanelSelect | PanelOption)[] = [];
    if (panel) collect(panel, all);
    const target = all.find((i) => i.id === itemId);
    const item = interaction.isStringSelectMenu()
        ? (target as PanelSelect | undefined)?.options?.find((o) => o.id === interaction.values[0])
        : (target as PanelButton | undefined);
    if (!item || !("action" in item)) {
        await interaction.reply({ content: L(lang, "This was removed from the panel.", "تمت إزالة هذا من اللوحة."), flags: MessageFlags.Ephemeral });
        return;
    }
    const member = interaction.member as GuildMember;
    if (item.allowedRoleIds.length && !item.allowedRoleIds.some((id) => member.roles.cache.has(id))) {
        await interaction.reply({ content: L(lang, "You can't use this.", "لا يمكنك استخدام هذا."), flags: MessageFlags.Ephemeral });
        return;
    }
    await act(interaction, item.action, lang, member);
}

async function act(interaction: Click, action: PanelAction, lang: TicketLanguage, member: GuildMember): Promise<void> {
    if (action.kind === "panel" && action.panelId) return showInfoPanel(interaction, action.panelId);
    if (action.kind === "reply" && action.reply.trim()) {
        await interaction.reply({ content: action.reply.slice(0, 2000), flags: MessageFlags.Ephemeral, allowedMentions: { parse: [] } });
        return;
    }
    if (action.kind === "role" && action.roleId) {
        const has = member.roles.cache.has(action.roleId);
        try {
            if (has) await member.roles.remove(action.roleId, "Info panel button");
            else await member.roles.add(action.roleId, "Info panel button");
            await interaction.reply({
                content: has ? L(lang, `Removed <@&${action.roleId}>.`, `تمت إزالة <@&${action.roleId}>.`) : L(lang, `Added <@&${action.roleId}>.`, `تمت إضافة <@&${action.roleId}>.`),
                flags: MessageFlags.Ephemeral,
                allowedMentions: { parse: [] },
            });
        } catch (err) {
            Logger.warn(`[info] role toggle failed in ${interaction.guildId}: ${err}`);
            await interaction.reply({ content: L(lang, "I could not change that role. My role may be below it.", "تعذّر تغيير هذه الرتبة، فقد تكون رتبة البوت أدنى منها."), flags: MessageFlags.Ephemeral });
        }
        return;
    }
    await interaction.deferUpdate();
}
