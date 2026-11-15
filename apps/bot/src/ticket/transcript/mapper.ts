import { EMBED_SNAPSHOT_LIMITS, isImageAttachment, type AttachmentSnapshot, type ComponentSnapshot, type EmbedSummary, type MessageSnapshot } from "@robo/shared";

// A Discord message as a transcript snapshot (Credora's transcript mapper, Discord Bots/credora apps/bot/src/features/
// shared/transcript). Partial messages (uncached edits and deletes) give nulls and list what is missing, so nothing is
// silently treated as empty. A structural type keeps it testable without a gateway connection.

export interface MessageLike {
    id: string;
    channelId: string;
    guildId: string | null;
    partial: boolean;
    content: string | null;
    type: number | null;
    flags?: { bitfield: number } | null;
    createdTimestamp?: number | null;
    editedTimestamp: number | null;
    reference?: { messageId?: string | undefined } | null;
    webhookId?: string | null;
    pinned?: boolean | null;
    system?: boolean | null;
    author?: { id: string; username: string; globalName?: string | null; bot: boolean; system?: boolean; displayAvatarURL?: () => string } | null;
    member?: { displayName?: string | null } | null;
    mentions?: { users: { keys(): Iterable<string> }; roles: { keys(): Iterable<string> }; channels: { keys(): Iterable<string> }; everyone: boolean } | null;
    embeds?: readonly {
        data?: { type?: string };
        title: string | null;
        url: string | null;
        description?: string | null;
        color?: number | null;
        timestamp?: string | null;
        author?: { name: string; url?: string | null; iconURL?: string | null } | null;
        footer?: { text: string; iconURL?: string | null } | null;
        image: unknown;
        thumbnail: unknown;
        fields: readonly unknown[];
    }[];
    components?: readonly unknown[] | null;
    stickers?: { values(): Iterable<{ id: string; name: string; format?: number | null }> } | null;
    attachments?: {
        values(): Iterable<{
            id: string; url: string; proxyURL?: string | null; name: string; contentType: string | null; size: number; width: number | null; height: number | null;
            duration?: number | null; waveform?: string | null; spoiler: boolean; description: string | null;
        }>;
    } | null;
}

const cut = (v: string | null | undefined, max: number): string | null => (typeof v === "string" ? v.slice(0, max) : null);
const mediaUrl = (media: unknown): string | null => {
    if (!media || typeof media !== "object") return null;
    const m = media as { url?: unknown; proxyURL?: unknown };
    return typeof m.url === "string" ? m.url : typeof m.proxyURL === "string" ? m.proxyURL : null;
};

type EmbedLike = NonNullable<MessageLike["embeds"]>[number];

export function toEmbedSnapshot(e: EmbedLike): EmbedSummary {
    const L = EMBED_SNAPSHOT_LIMITS;
    const fields = (e.fields ?? [])
        .filter((f): f is { name: string; value: string; inline?: boolean } => !!f && typeof (f as { name?: unknown }).name === "string")
        .slice(0, L.fields)
        .map((f) => ({ name: f.name.slice(0, L.fieldName), value: String(f.value ?? "").slice(0, L.fieldValue), inline: Boolean(f.inline) }));
    return {
        type: e.data?.type ?? null,
        title: cut(e.title, L.title),
        url: e.url ?? null,
        hasImage: Boolean(e.image),
        hasThumbnail: Boolean(e.thumbnail),
        fieldCount: e.fields?.length ?? 0,
        description: cut(e.description, L.description),
        color: typeof e.color === "number" ? e.color : null,
        timestamp: e.timestamp ?? null,
        author: e.author?.name ? { name: e.author.name.slice(0, L.author), url: e.author.url ?? null, iconUrl: e.author.iconURL ?? null } : null,
        footer: e.footer?.text ? { text: e.footer.text.slice(0, L.footer), iconUrl: e.footer.iconURL ?? null } : null,
        imageUrl: mediaUrl(e.image),
        thumbnailUrl: mediaUrl(e.thumbnail),
        fields,
    };
}

/* ---- components (classic action rows and Components V2), bounded (Credora's discord-kit components-snapshot) ---- */

const T = { actionRow: 1, button: 2, stringSelect: 3, userSelect: 5, roleSelect: 6, mentionableSelect: 7, channelSelect: 8, section: 9, textDisplay: 10, thumbnail: 11, mediaGallery: 12, file: 13, separator: 14, container: 17 } as const;
type Raw = Record<string, unknown>;
const str = (v: unknown, max = 512): string | null => (typeof v === "string" ? v.slice(0, max) : null);
const media = (v: unknown): string | null => {
    const m = v as { url?: unknown; proxy_url?: unknown } | undefined;
    return str(m?.url, 2000) ?? str(m?.proxy_url, 2000);
};
const emojiText = (v: unknown): string | null => {
    const e = v as { id?: string | null; name?: string | null; animated?: boolean } | undefined;
    if (!e?.name) return null;
    return e.id ? `<${e.animated ? "a" : ""}:${e.name}:${e.id}>` : e.name;
};

function one(raw: Raw, depth: number): ComponentSnapshot | null {
    const children = (key: string) => (depth >= 4 ? [] : ((raw[key] as Raw[] | undefined) ?? []).slice(0, 40).map((c) => one(c, depth + 1)).filter((c): c is ComponentSnapshot => c !== null));
    switch (raw.type) {
        case T.container: return { type: "container", accentColor: typeof raw.accent_color === "number" ? raw.accent_color : null, spoiler: raw.spoiler === true, children: children("components") };
        case T.textDisplay: return { type: "text", content: str(raw.content, 4000) ?? "" };
        case T.section: return { type: "section", children: children("components"), accessory: raw.accessory ? one(raw.accessory as Raw, depth + 1) : null };
        case T.separator: return { type: "separator", divider: raw.divider !== false };
        case T.actionRow: return { type: "actionRow", children: children("components") };
        case T.button: return { type: "button", label: str(raw.label, 80), style: typeof raw.style === "number" ? raw.style : null, url: str(raw.url, 2000), emoji: emojiText(raw.emoji), disabled: raw.disabled === true };
        case T.stringSelect: case T.userSelect: case T.roleSelect: case T.mentionableSelect: case T.channelSelect:
            return { type: "select", label: str(raw.placeholder, 150), disabled: raw.disabled === true };
        case T.thumbnail: return { type: "thumbnail", mediaUrls: [media(raw.media)].filter((u): u is string => !!u), spoiler: raw.spoiler === true };
        case T.mediaGallery: return { type: "gallery", mediaUrls: ((raw.items as Raw[] | undefined) ?? []).slice(0, 10).map((i) => media(i.media)).filter((u): u is string => !!u) };
        case T.file: return { type: "file", mediaUrls: [media(raw.file)].filter((u): u is string => !!u), spoiler: raw.spoiler === true };
        default: return null;
    }
}

export function snapshotComponents(raw: readonly unknown[] | null | undefined): ComponentSnapshot[] {
    return (raw ?? []).slice(0, 40).map((c) => (c && typeof c === "object" ? one(c as Raw, 0) : null)).filter((c): c is ComponentSnapshot => c !== null);
}

const iso = (ms: number | null | undefined): string | null => (typeof ms === "number" && ms > 0 ? new Date(ms).toISOString() : null);

export function toMessageSnapshot(message: MessageLike, guildIdFallback: string): MessageSnapshot {
    const incomplete: string[] = [];
    const partial = message.partial;
    if (partial || message.content === null) incomplete.push("content");
    if (!message.author) incomplete.push("author");
    if (partial && !message.attachments) incomplete.push("attachments");

    // Discord marks voice messages with the IS_VOICE_MESSAGE flag (1 << 13).
    const voiceMessage = ((message.flags?.bitfield ?? 0) & (1 << 13)) !== 0;
    const attachments: AttachmentSnapshot[] = message.attachments
        ? [...message.attachments.values()].map((a) => ({
            id: a.id, url: a.url, proxyUrl: a.proxyURL ?? null, filename: a.name, contentType: a.contentType ?? null, size: a.size,
            width: a.width ?? null, height: a.height ?? null, durationSeconds: a.duration ?? null, spoiler: a.spoiler, description: a.description ?? null,
            isImage: isImageAttachment(a.contentType, a.name), isVoiceMessage: voiceMessage && (a.contentType?.startsWith("audio/") ?? true), waveform: a.waveform ?? null,
        }))
        : [];

    return {
        messageId: message.id,
        channelId: message.channelId,
        guildId: message.guildId ?? guildIdFallback,
        author: message.author
            ? {
                id: message.author.id,
                username: message.author.username ?? null,
                globalName: message.author.globalName ?? null,
                displayName: message.member?.displayName ?? message.author.globalName ?? message.author.username ?? null,
                avatarUrl: message.author.displayAvatarURL?.() ?? null,
                bot: message.author.bot,
                system: message.author.system ?? false,
            }
            : null,
        content: partial ? null : message.content,
        type: message.type ?? null,
        flags: message.flags?.bitfield ?? null,
        createdAt: iso(message.createdTimestamp),
        editedAt: iso(message.editedTimestamp),
        referenceMessageId: message.reference?.messageId ?? null,
        webhookId: message.webhookId ?? null,
        pinned: message.pinned ?? null,
        system: message.system ?? null,
        mentions: message.mentions
            ? { users: [...message.mentions.users.keys()], roles: [...message.mentions.roles.keys()], channels: [...message.mentions.channels.keys()], everyone: message.mentions.everyone }
            : { users: [], roles: [], channels: [], everyone: false },
        embeds: (message.embeds ?? []).map(toEmbedSnapshot),
        components: snapshotComponents((message.components ?? []).map((c) => (c && typeof (c as { toJSON?: unknown }).toJSON === "function" ? (c as { toJSON(): unknown }).toJSON() : c))),
        stickers: message.stickers ? [...message.stickers.values()].map((s) => ({ id: s.id, name: s.name, formatType: s.format ?? null })) : [],
        attachments,
        incompleteFields: incomplete,
    };
}
