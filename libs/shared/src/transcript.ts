// Transcripts: every message in a ticket channel is captured while the ticket is open (created, edited, deleted,
// reactions, renames), then folded into one self-contained document the transcript page renders. The same shapes as
// Credora's transcripts (Discord Bots/credora packages/contracts/src/transcript), adapted to tickets.

export const TRANSCRIPT_EVENT_TYPES = ['message.created', 'message.updated', 'message.deleted', 'reaction.added', 'reaction.removed'] as const;
export type TranscriptEventType = (typeof TRANSCRIPT_EVENT_TYPES)[number];

export interface AuthorSnapshot {
    id: string;
    username: string | null;
    globalName: string | null;
    displayName: string | null;
    avatarUrl: string | null;
    bot: boolean;
    system: boolean;
}

export interface AttachmentSnapshot {
    id: string;
    url: string;
    proxyUrl: string | null;
    filename: string;
    contentType: string | null;
    size: number;
    width: number | null;
    height: number | null;
    durationSeconds: number | null;
    spoiler: boolean;
    description: string | null;
    isImage: boolean;
    /** A Discord voice message (playable audio with a waveform). */
    isVoiceMessage?: boolean;
    /** Base64 waveform of a voice message, when Discord provides it. */
    waveform?: string | null;
}

export interface EmbedSummary {
    type: string | null;
    title: string | null;
    url: string | null;
    hasImage: boolean;
    hasThumbnail: boolean;
    fieldCount: number;
    description?: string | null;
    color?: number | null;
    timestamp?: string | null;
    author?: { name: string; url: string | null; iconUrl: string | null } | null;
    footer?: { text: string; iconUrl: string | null } | null;
    imageUrl?: string | null;
    thumbnailUrl?: string | null;
    fields?: { name: string; value: string; inline: boolean }[];
}

export type ComponentSnapshotType = 'container' | 'text' | 'section' | 'separator' | 'actionRow' | 'button' | 'select' | 'thumbnail' | 'gallery' | 'file';

export interface ComponentSnapshot {
    type: ComponentSnapshotType;
    content?: string;
    accentColor?: number | null;
    spoiler?: boolean;
    label?: string | null;
    style?: number | null;
    url?: string | null;
    emoji?: string | null;
    disabled?: boolean;
    mediaUrls?: string[];
    divider?: boolean;
    children?: ComponentSnapshot[];
    accessory?: ComponentSnapshot | null;
}

export const EMBED_SNAPSHOT_LIMITS = { title: 256, description: 4096, fieldName: 256, fieldValue: 1024, fields: 25, footer: 2048, author: 256 } as const;

/** Sticker; `formatType`: 1 PNG, 2 APNG, 3 Lottie, 4 GIF (Discord API). */
export interface StickerSnapshot {
    id: string;
    name: string;
    formatType?: number | null;
}

export interface ReactionEmoji {
    id: string | null;
    name: string;
    animated: boolean;
}

export const reactionKey = (emoji: ReactionEmoji): string => emoji.id ?? emoji.name;

/** Who deleted a message: the author, a moderator (audit log), a bot, or unknown. */
export interface DeletedBy {
    userId: string | null;
    kind: 'self' | 'moderator' | 'bot' | 'unknown';
}

export interface MessageSnapshot {
    messageId: string;
    channelId: string;
    guildId: string;
    author: AuthorSnapshot | null;
    content: string | null;
    type: number | null;
    flags: number | null;
    createdAt: string | null;
    editedAt: string | null;
    referenceMessageId: string | null;
    webhookId: string | null;
    pinned: boolean | null;
    system: boolean | null;
    mentions: { users: string[]; roles: string[]; channels: string[]; everyone: boolean };
    embeds: EmbedSummary[];
    components?: ComponentSnapshot[];
    stickers: StickerSnapshot[];
    attachments: AttachmentSnapshot[];
    /** Field names Discord didn't deliver (a partial message): never silently treated as empty. */
    incompleteFields: string[];
}

export const TICKET_CHANNEL_EVENT_TYPES = ['renamed', 'topic_changed'] as const;
export type TicketChannelEventType = (typeof TICKET_CHANNEL_EVENT_TYPES)[number];

export interface TicketChannelEvent {
    type: TicketChannelEventType;
    from: string | null;
    to: string | null;
    at: string;
}

export interface TranscriptUser {
    id: string;
    username: string | null;
    displayName: string | null;
    avatarUrl: string | null;
    bot: boolean;
}

export interface TranscriptMessageView {
    messageId: string;
    authorId: string | null;
    content: string | null;
    createdAt: string | null;
    editedAt: string | null;
    deleted: boolean;
    deletedAt: string | null;
    revision: number;
    referenceMessageId: string | null;
    isBot: boolean;
    isSystem: boolean;
    mentions: MessageSnapshot['mentions'];
    embeds: EmbedSummary[];
    components?: ComponentSnapshot[];
    stickers: StickerSnapshot[];
    reactions?: { emoji: ReactionEmoji; userIds: string[] }[];
    deletedBy?: DeletedBy | null;
    attachments: AttachmentSnapshot[];
    incompleteFields: string[];
    /** Earlier contents, oldest first (from edit events). */
    editHistory: { at: string | null; before: string | null; after: string | null }[];
}

export const TRANSCRIPT_FORMAT = 'robtic.ticket.transcript.v1';

/** Unguessable public transcript id: `tr_` + 32 characters [a-z2-9] (about 160 bits). */
export const TRANSCRIPT_PUBLIC_ID_PATTERN = /^tr_[a-z2-9]{32}$|^tr_showcase$/;

export type ParticipantRole = 'owner' | 'claimer' | 'added' | 'staff';

/** The self-contained document the transcript page renders. Never holds ids of other servers or secrets. */
export interface TicketTranscriptDocument {
    format: typeof TRANSCRIPT_FORMAT;
    transcriptId: string;
    generatedAt: string;
    locale: 'en' | 'ar';
    guild: { id: string; name: string | null; iconUrl: string | null };
    ticket: {
        number: number;
        channelId: string | null;
        channelName: string;
        channelTopic: string | null;
        panelName: string;
        optionLabel: string;
        openedAt: string | null;
        closedAt: string | null;
        closedBy: string | null;
        closeReason: string | null;
        ownerId: string;
        claimerId: string | null;
        participants: { userId: string; role: ParticipantRole; addedAt: string | null; removedAt: string | null }[];
        /** The form the owner filled in before the ticket opened. */
        answers: { question: string; answer: string }[];
    };
    users: Record<string, TranscriptUser>;
    messages: TranscriptMessageView[];
    channelEvents: TicketChannelEvent[];
    stats: {
        messageCount: number;
        deletedCount: number;
        editedCount: number;
        attachmentCount: number;
        imageCount: number;
        renameCount: number;
        participantCount: number;
    };
}

const IMAGE_EXTENSIONS = /\.(png|jpe?g|gif|webp|bmp|avif|heic|svg)$/i;

/** Image detection from content type, falling back to the file name. */
export const isImageAttachment = (contentType: string | null | undefined, filename: string): boolean =>
    contentType ? contentType.toLowerCase().startsWith('image/') : IMAGE_EXTENSIONS.test(filename);
