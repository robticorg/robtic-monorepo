// ---- copied from robtic-discord libs/shared/src/ticket.ts and panels.ts (the dashboard's contract). Change both together. ----
// Only this header differs: the dashboard types the contract leans on are copied in here.

export type Snowflake = string;

/** The bot's look in a server (the dashboard saves it to Discord directly; the bot never reads it). */
export interface BotProfile { nickname: string | null; avatarUrl: string | null; bannerUrl: string | null; bio: string | null }
export const defaultProfile = (): BotProfile => ({ nickname: null, avatarUrl: null, bannerUrl: null, bio: null });
export const validateProfile = (_p: BotProfile): string[] => [];

/* ================================================================== panels.ts */

// Panels a server builds on the dashboard and the bot posts: either a Components V2 message (containers, text,
// sections, galleries, separators, buttons and menus, exactly the blocks Discord offers) or a classic embed with rows of
// buttons or a menu. Every button and menu option does one thing when clicked: reply with a message, give or take a
// role, or open a link; and can be limited to some roles. Limits are Discord's (docs.discord.com → Components).

export const PANEL_LIMITS = {
    /** Discord: "Messages allow up to 40 total components." */
    components: 40,
    /** Total text across Text Displays in one message. */
    text: 4000,
    sectionTexts: 3,
    galleryItems: 10,
    rowButtons: 5,
    selectOptions: 25,
    buttonLabel: 80,
    optionLabel: 100,
    optionDescription: 100,
    placeholder: 150,
    mediaDescription: 1024,
    /** Classic messages: up to 5 action rows. */
    embedRows: 5,
    embedTitle: 256,
    embedDescription: 4096,
    embedFields: 25,
    fieldName: 256,
    fieldValue: 1024,
    footer: 2048,
    embedTotal: 6000,
    replyText: 2000,
    panels: 25,
} as const;

export type ButtonStyleName = 'primary' | 'secondary' | 'success' | 'danger' | 'link';
export const BUTTON_STYLES: readonly (readonly [ButtonStyleName, string])[] = [
    ['primary', 'Blurple'], ['secondary', 'Grey'], ['success', 'Green'], ['danger', 'Red'], ['link', 'Link'],
];

/** What clicking does. A link button opens its URL and nothing else (Discord sends no interaction for links). */
export interface PanelAction {
    /** 'panel': shows another of the server's panels to the clicker only (a menu that opens sub-pages). */
    kind: 'reply' | 'role' | 'panel' | 'none';
    /** kind 'reply': the message the clicker sees (only them). */
    reply: string;
    /** kind 'role': the role given, or taken if they already have it. */
    roleId: string | null;
    /** kind 'panel': the panel shown. */
    panelId?: string | null;
}

export interface PanelButton {
    id: string;
    label: string;
    emoji: string;
    style: ButtonStyleName;
    /** Only for style 'link'. */
    url: string;
    action: PanelAction;
    /** Only these roles may use it (empty = everyone). */
    allowedRoleIds: string[];
}

export interface PanelOption {
    id: string;
    label: string;
    description: string;
    emoji: string;
    action: PanelAction;
    allowedRoleIds: string[];
}

export interface PanelSelect {
    id: string;
    placeholder: string;
    options: PanelOption[];
}

export interface MediaItem { url: string; description: string; spoiler: boolean }

export type PanelBlock =
    | { id: string; type: 'text'; content: string }
    | { id: string; type: 'section'; texts: string[]; accessory: { kind: 'thumbnail'; media: MediaItem } | { kind: 'button'; button: PanelButton } }
    | { id: string; type: 'gallery'; items: MediaItem[] }
    | { id: string; type: 'separator'; divider: boolean; spacing: 1 | 2 }
    | { id: string; type: 'buttons'; buttons: PanelButton[] }
    | { id: string; type: 'select'; select: PanelSelect }
    | { id: string; type: 'container'; accent: string | null; spoiler: boolean; children: PanelBlock[] }
    /** Robtic Music's controls (its buttons or its menu), only on the music panel: placed anywhere, never removed. */
    | { id: string; type: 'music' };

export type PanelRow =
    | { id: string; type: 'buttons'; buttons: PanelButton[] }
    | { id: string; type: 'select'; select: PanelSelect }
    /** Robtic Music's controls under an embed (music panel only). */
    | { id: string; type: 'music' };

export interface PanelEmbed {
    color: string | null;
    author: string;
    title: string;
    url: string;
    description: string;
    fields: { id: string; name: string; value: string; inline: boolean }[];
    thumbnail: string;
    image: string;
    footer: string;
}

export interface Panel {
    id: string;
    name: string;
    format: 'components' | 'embed';
    channelId: string | null;
    /** Components V2 message. */
    blocks: PanelBlock[];
    /** Classic message. */
    embed: PanelEmbed;
    rows: PanelRow[];
    /** Where it was last posted, so "Update" edits that message. */
    posted: { channelId: string; messageId: string; at: string } | null;
}

/* ------------------------------------------------------------------ factories */

let seq = 0;
export const panelId = (p: string) => `${p}${Date.now().toString(36)}${(seq++).toString(36)}`;
export const noAction = (): PanelAction => ({ kind: 'none', reply: '', roleId: null });
export const newButton = (label = 'Button'): PanelButton => ({ id: panelId('b'), label, emoji: '', style: 'primary', url: '', action: noAction(), allowedRoleIds: [] });
export const newOption = (label = 'Option'): PanelOption => ({ id: panelId('o'), label, description: '', emoji: '', action: noAction(), allowedRoleIds: [] });
export const newSelect = (): PanelSelect => ({ id: panelId('s'), placeholder: 'Choose an option', options: [newOption('Option 1')] });
export const newMedia = (): MediaItem => ({ url: '', description: '', spoiler: false });

export const BLOCK_KINDS = [
    ['container', 'Container', 'A card with an accent colour that holds other blocks.'],
    ['text', 'Text', 'Markdown text: headings, lists, links, mentions.'],
    ['section', 'Section', 'Up to 3 lines of text with a thumbnail or a button beside them.'],
    ['gallery', 'Image gallery', '1 to 10 images or GIFs.'],
    ['separator', 'Separator', 'A divider line or a gap.'],
    ['buttons', 'Buttons', 'A row of up to 5 buttons.'],
    ['select', 'Menu', 'A dropdown with up to 25 options.'],
] as const;
export type BlockKind = (typeof BLOCK_KINDS)[number][0];

export function newBlock(kind: BlockKind): PanelBlock {
    const id = panelId('k');
    switch (kind) {
        case 'container': return { id, type: 'container', accent: '#1793ff', spoiler: false, children: [{ id: panelId('k'), type: 'text', content: '## Title\nWrite something here.' }] };
        case 'text': return { id, type: 'text', content: 'Write something here.' };
        case 'section': return { id, type: 'section', texts: ['**Title**', 'A line about it.'], accessory: { kind: 'thumbnail', media: newMedia() } };
        case 'gallery': return { id, type: 'gallery', items: [newMedia()] };
        case 'separator': return { id, type: 'separator', divider: true, spacing: 1 };
        case 'buttons': return { id, type: 'buttons', buttons: [newButton('Button')] };
        case 'select': return { id, type: 'select', select: newSelect() };
    }
}

export const emptyEmbed = (): PanelEmbed => ({ color: '#1793ff', author: '', title: 'Title', url: '', description: 'Write something here.', fields: [], thumbnail: '', image: '', footer: '' });

export function newPanel(name = 'New panel'): Panel {
    return {
        id: panelId('p'),
        name,
        format: 'components',
        channelId: null,
        blocks: [newBlock('container')],
        embed: emptyEmbed(),
        rows: [],
        posted: null,
    };
}

/* ------------------------------------------------------------------ counting and checking against Discord's limits */

/** How many components Discord counts for these blocks (every block, its children, buttons and accessories). `music`: what the music controls count. */
export function countComponents(blocks: readonly PanelBlock[], music = 0): number {
    let n = 0;
    for (const b of blocks) {
        switch (b.type) {
            case 'text': case 'gallery': case 'separator': n += 1; break;
            case 'section': n += 1 + b.texts.filter((t) => t.trim()).length + 1; break;
            case 'buttons': n += 1 + b.buttons.length; break;
            case 'select': n += 2; break;
            case 'container': n += 1 + countComponents(b.children, music); break;
            case 'music': n += music; break;
        }
    }
    return n;
}

/** Total characters across the message's Text Displays (sections included). */
export function countText(blocks: readonly PanelBlock[]): number {
    let n = 0;
    for (const b of blocks) {
        if (b.type === 'text') n += b.content.length;
        else if (b.type === 'section') n += b.texts.join('').length;
        else if (b.type === 'container') n += countText(b.children);
    }
    return n;
}

const isUrl = (v: string) => /^https:\/\/\S+$/i.test(v);
const isImage = (v: string) => isUrl(v) || /^data:image\/(png|jpeg|webp|gif);base64,/.test(v);

function checkAction(where: string, a: PanelAction, errors: string[]) {
    if (a.kind === 'reply' && !a.reply.trim()) errors.push(`${where}: write the reply it sends.`);
    if (a.kind === 'reply' && a.reply.length > PANEL_LIMITS.replyText) errors.push(`${where}: the reply can be up to ${PANEL_LIMITS.replyText} characters.`);
    if (a.kind === 'role' && !a.roleId) errors.push(`${where}: choose the role it gives.`);
    if (a.kind === 'panel' && !a.panelId) errors.push(`${where}: choose the panel it shows.`);
}

function checkButton(b: PanelButton, errors: string[]) {
    const where = `Button “${b.label || b.emoji || '…'}”`;
    if (!b.label.trim() && !b.emoji.trim()) errors.push(`${where} needs a label or an emoji.`);
    if (b.label.length > PANEL_LIMITS.buttonLabel) errors.push(`${where}: labels are up to ${PANEL_LIMITS.buttonLabel} characters.`);
    if (b.style === 'link') { if (!isUrl(b.url) || b.url.length > 512) errors.push(`${where} needs an https:// link.`); }
    else checkAction(where, b.action, errors);
}

function checkSelect(s: PanelSelect, errors: string[]) {
    if (s.options.length < 1 || s.options.length > PANEL_LIMITS.selectOptions) errors.push(`A menu needs 1 to ${PANEL_LIMITS.selectOptions} options.`);
    if (s.placeholder.length > PANEL_LIMITS.placeholder) errors.push(`A menu’s placeholder is up to ${PANEL_LIMITS.placeholder} characters.`);
    for (const o of s.options) {
        if (!o.label.trim() || o.label.length > PANEL_LIMITS.optionLabel) errors.push(`Menu options need a label (up to ${PANEL_LIMITS.optionLabel} characters).`);
        if (o.description.length > PANEL_LIMITS.optionDescription) errors.push(`“${o.label}”: descriptions are up to ${PANEL_LIMITS.optionDescription} characters.`);
        checkAction(`Option “${o.label}”`, o.action, errors);
    }
}

function checkBlocks(blocks: readonly PanelBlock[], errors: string[], inContainer: boolean, music: boolean) {
    for (const b of blocks) {
        switch (b.type) {
            case 'text': if (!b.content.trim()) errors.push('A text block is empty.'); break;
            case 'section':
                if (b.texts.filter((t) => t.trim()).length < 1 || b.texts.length > PANEL_LIMITS.sectionTexts) errors.push(`A section needs 1 to ${PANEL_LIMITS.sectionTexts} lines of text.`);
                if (b.accessory.kind === 'thumbnail' && !isImage(b.accessory.media.url)) errors.push('A section’s thumbnail needs an image.');
                if (b.accessory.kind === 'button') checkButton(b.accessory.button, errors);
                break;
            case 'gallery':
                if (b.items.length < 1 || b.items.length > PANEL_LIMITS.galleryItems) errors.push(`A gallery holds 1 to ${PANEL_LIMITS.galleryItems} images.`);
                if (b.items.some((i) => !isImage(i.url))) errors.push('Every gallery item needs an image.');
                break;
            case 'buttons':
                if (b.buttons.length < 1 || b.buttons.length > PANEL_LIMITS.rowButtons) errors.push(`A button row holds 1 to ${PANEL_LIMITS.rowButtons} buttons.`);
                b.buttons.forEach((x) => checkButton(x, errors));
                break;
            case 'select': checkSelect(b.select, errors); break;
            case 'container':
                if (inContainer) errors.push('A container can’t hold another container.');
                if (b.children.length === 0) errors.push('A container is empty.');
                checkBlocks(b.children, errors, true, music);
                break;
            case 'music':
                if (!music) errors.push('Music controls only work on the Robtic Music panel.');
                break;
        }
    }
}

/**
 * Checks a panel against Discord's limits. `music`: it's Robtic Music's panel, whose controls count this many
 * components (System's panels can't hold music controls).
 */
export function validatePanel(p: Panel, music?: { components: number }): string[] {
    const errors: string[] = [];
    if (!music && (!p.name.trim() || p.name.length > 60)) errors.push('Give the panel a name (up to 60 characters).');
    if (p.format === 'components') {
        if (p.blocks.length === 0) errors.push('Add at least one block.');
        const c = countComponents(p.blocks, music?.components ?? 0);
        if (c > PANEL_LIMITS.components) errors.push(`This panel uses ${c} components; Discord allows ${PANEL_LIMITS.components}.`);
        const t = countText(p.blocks);
        if (t > PANEL_LIMITS.text) errors.push(`This panel has ${t.toLocaleString('en')} characters of text; Discord allows ${PANEL_LIMITS.text.toLocaleString('en')}.`);
        checkBlocks(p.blocks, errors, false, !!music);
    } else {
        const e = p.embed;
        const total = e.title.length + e.description.length + e.author.length + e.footer.length + e.fields.reduce((s, f) => s + f.name.length + f.value.length, 0);
        if (!e.title.trim() && !e.description.trim() && e.fields.length === 0 && !e.image) errors.push('The embed is empty.');
        if (e.title.length > PANEL_LIMITS.embedTitle) errors.push(`The title is up to ${PANEL_LIMITS.embedTitle} characters.`);
        if (e.description.length > PANEL_LIMITS.embedDescription) errors.push(`The description is up to ${PANEL_LIMITS.embedDescription.toLocaleString('en')} characters.`);
        if (e.fields.length > PANEL_LIMITS.embedFields) errors.push(`An embed has up to ${PANEL_LIMITS.embedFields} fields.`);
        if (e.fields.some((f) => !f.name.trim() || !f.value.trim())) errors.push('Every field needs a name and a value.');
        if (total > PANEL_LIMITS.embedTotal) errors.push(`An embed holds up to ${PANEL_LIMITS.embedTotal.toLocaleString('en')} characters in all.`);
        if ((e.image && !isImage(e.image)) || (e.thumbnail && !isImage(e.thumbnail))) errors.push('Embed images need an https:// link or an upload.');
        if (e.url && !isUrl(e.url)) errors.push('The title link must be https://.');
        if (p.rows.length > PANEL_LIMITS.embedRows) errors.push(`A message has up to ${PANEL_LIMITS.embedRows} rows of buttons or menus.`);
        for (const r of p.rows) {
            if (r.type === 'music') { if (!music) errors.push('Music controls only work on the Robtic Music panel.'); continue; }
            if (r.type === 'buttons') {
                if (r.buttons.length < 1 || r.buttons.length > PANEL_LIMITS.rowButtons) errors.push(`A button row holds 1 to ${PANEL_LIMITS.rowButtons} buttons.`);
                r.buttons.forEach((x) => checkButton(x, errors));
            } else checkSelect(r.select, errors);
        }
    }
    return [...new Set(errors)];
}


/* ================================================================== ticket.ts */


// Robtic Ticket: ticket panels a server designs on the dashboard and the bot (Discord Bots/Public Ticket) runs. One
// settings document per server holds everything: the panels (each a message with its ticket options as buttons or a
// menu), and for every option what happens when a member opens it: the channel it makes, who sees it and what they may
// do there, the message the bot posts inside it and that message's ticket controls (Close, Claim, Rename…), and the
// message posted when it closes. Info panels (the same builder as Robtic System's panels) are shown to whoever presses
// an info button: a block of its own (buttons or a menu) in a Components message. Every ticket option and control is a
// button or an entry in the message's one menu (`placement`; the closed message has its own, `closedPlacement`).
//
// Channels and categories cascade: a ticket option's own choice wins, then its panel's, then the server's (Settings).
//
// The bot keeps a copy of these types (Public Ticket libs/shared/src/settings.ts). Change both together.


/** A deep copy of plain JSON data (settings are JSON; structuredClone isn't in this library's lib). */
const cloneJson = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;
export const TICKET_LIMITS = {
    /** No real cap on panels or options a server makes; these only keep one document sane. */
    panels: 50,
    /** Discord: 25 options in a menu; 5 rows of 5 buttons under a message. */
    menuOptions: 25,
    buttonOptions: 25,
    label: 80,
    optionLabel: 100,
    description: 100,
    placeholder: 150,
    emoji: 64,
    channelName: 90,
    content: 2000,
    /** Discord's popup holds 5 questions. */
    questions: 5,
    question: 45,
    answer: 4000,
    /** A menu question: 25 choices; radio buttons and checkboxes: 10. */
    choices: 25,
    groupChoices: 10,
    files: 10,
    /** Open tickets one member may have from one option at a time (0 = no limit). */
    perMember: 50,
    prefix: 5,
    notice: 500,
    aliases: 8,
    alias: 20,
    /** Minutes between two calls of !come in one ticket. */
    cooldown: 1440,
    /** Seconds Delete waits before the channel goes. */
    deleteDelay: 60,
    /** Sleep: minutes before the reminder and before closing (30 days at most). */
    sleepMinutes: 43_200,
    /** Auto-delete after closing: up to 7 days, in seconds. */
    autoDelete: 604_800,
    confirmText: 300,
    templates: 100,
    templateName: 60,
} as const;

export type TicketLanguage = 'en' | 'ar';
export type TicketButtonStyle = 'primary' | 'secondary' | 'success' | 'danger';
export const TICKET_BUTTON_STYLES: readonly (readonly [TicketButtonStyle, string])[] = [['primary', 'Blurple'], ['secondary', 'Grey'], ['success', 'Green'], ['danger', 'Red']];

/** Where an option, control or info button sits: a button, or an entry in the message's one menu (under the buttons). */
export type ItemPlacement = 'button' | 'menu';

/** An info button: shows one of the server's info panels to whoever presses it (only them). */
export interface TicketInfoItem {
    id: string;
    label: string;
    emoji: string;
    style: TicketButtonStyle;
    /** In a menu: the small line under the label. */
    description: string;
    /** The info panel it shows (an existing one from the Info panels page). */
    panelId: string;
}

export const newInfoItem = (panel: string, label = 'Info'): TicketInfoItem => ({
    id: panelId('n'), label, emoji: 'ℹ️', style: 'secondary', description: '', panelId: panel,
});

/** A block of info buttons in a Components message: a row of buttons, or one menu. */
export interface InfoBlock {
    id: string;
    type: 'info';
    display: 'buttons' | 'menu';
    placeholder: string;
    items: TicketInfoItem[];
}

export const newInfoBlock = (panel: string, label = 'Info'): InfoBlock => ({
    id: panelId('v'), type: 'info', display: 'buttons', placeholder: 'More information', items: [newInfoItem(panel, label)],
});

/* ------------------------------------------------------------------ a message the bot sends */

/**
 * A message design: a classic embed (with optional text above it) or a Components V2 container. Its one interactive
 * part (the panel's ticket options, or the ticket controls inside a ticket) is the `slot`: under the embed, or wherever
 * the slot block sits among the blocks. It can be moved, never removed.
 */
export type MessageBlock =
    | { id: string; type: 'text'; content: string }
    | { id: string; type: 'image'; url: string }
    | { id: string; type: 'thumbText'; content: string; thumbnail: string }
    | { id: string; type: 'separator'; divider: boolean; spacing: 1 | 2 }
    | InfoBlock
    | { id: string; type: 'slot' }
    /** Components only: where the controls' menu goes when it's split from their buttons (else it follows them). */
    | { id: string; type: 'slotMenu' };

/** A short designed message (a notice, a confirmation, a DM): an embed with this text, or a container. */
export const simpleDesign = (text: string, color = '#1793ff'): MessageDesign => ({
    format: 'embed',
    content: '',
    embed: { color, author: '', title: '', url: '', description: text, fields: [], thumbnail: '', image: '', footer: '' },
    accent: color,
    blocks: [{ id: 't', type: 'text', content: text }, { id: 'slot', type: 'slot' }],
});

export const MESSAGE_BLOCK_KINDS = [
    ['text', 'Text', 'Markdown: headings, lists, links, mentions.'],
    ['thumbText', 'Text with a picture', 'Text with a small picture beside it.'],
    ['image', 'Image', 'A wide picture or GIF.'],
    ['separator', 'Separator', 'A divider line or a gap.'],
    ['info', 'Info buttons', 'Buttons or a menu that show your info panels.'],
] as const;
export type MessageBlockKind = (typeof MESSAGE_BLOCK_KINDS)[number][0];

export interface MessageDesign {
    format: 'embed' | 'components';
    /** Embed only: plain text above the embed (mentions ping here, e.g. {user} or {support}). */
    content: string;
    embed: PanelEmbed;
    /** Components only: the container's accent colour (null: none). */
    accent: string | null;
    blocks: MessageBlock[];
}

export const SLOT_ID = 'slot';

/* ------------------------------------------------------------------ who: the people a ticket deals with */

/**
 * The people a ticket's permissions and controls talk about. `everyone` is the server's @everyone; `owner` opened it;
 * `claimer` claimed it; `support` and `manager` are the option's roles; `added` are members added with Add.
 */
export const TICKET_TARGETS = ['everyone', 'owner', 'claimer', 'added', 'support', 'manager'] as const;
export type TicketTarget = (typeof TICKET_TARGETS)[number];
export const TICKET_TARGET_INFO: Record<TicketTarget, { name: string; does: string }> = {
    everyone: { name: '@everyone', does: 'Everyone in the server.' },
    owner: { name: 'Ticket owner', does: 'The member who opened the ticket.' },
    claimer: { name: 'Claimer', does: 'The staff member who claimed it.' },
    added: { name: 'Added members', does: 'Members added to the ticket with Add.' },
    support: { name: 'Support roles', does: 'The roles that answer this kind of ticket.' },
    manager: { name: 'Manager roles', does: 'Roles above support: they can do everything.' },
};

/** Who may use something: some of the ticket's people, and any other roles. */
export interface TicketWho {
    who: TicketTarget[];
    roleIds: Snowflake[];
}

/* ------------------------------------------------------------------ Discord channel permissions */

/** One Discord permission a ticket channel can set, with its bit (Discord API v10). */
export interface ChannelPermissionInfo { key: string; bit: bigint; name: string; does: string }

/** The text-channel permissions, grouped as Discord's channel settings show them. */
export const CHANNEL_PERMISSION_GROUPS: readonly { name: string; perms: readonly ChannelPermissionInfo[] }[] = [
    {
        name: 'General channel permissions',
        perms: [
            { key: 'ViewChannel', bit: 1n << 10n, name: 'View Channel', does: 'Lets them see the ticket and read its messages.' },
            { key: 'ManageChannels', bit: 1n << 4n, name: 'Manage Channel', does: 'Change the ticket’s name, topic and settings, or delete it.' },
            { key: 'ManageRoles', bit: 1n << 28n, name: 'Manage Permissions', does: 'Change this ticket’s permissions.' },
            { key: 'ManageWebhooks', bit: 1n << 29n, name: 'Manage Webhooks', does: 'Create, edit or delete webhooks here.' },
        ],
    },
    {
        name: 'Membership permissions',
        perms: [
            { key: 'CreateInstantInvite', bit: 1n << 0n, name: 'Create Invite', does: 'Invite friends with a link to this channel.' },
        ],
    },
    {
        name: 'Text channel permissions',
        perms: [
            { key: 'SendMessages', bit: 1n << 11n, name: 'Send Messages', does: 'Write in the ticket.' },
            { key: 'SendMessagesInThreads', bit: 1n << 38n, name: 'Send Messages in Threads', does: 'Write in threads of the ticket.' },
            { key: 'CreatePublicThreads', bit: 1n << 35n, name: 'Create Public Threads', does: 'Start threads everyone here can see.' },
            { key: 'CreatePrivateThreads', bit: 1n << 36n, name: 'Create Private Threads', does: 'Start invite-only threads.' },
            { key: 'EmbedLinks', bit: 1n << 14n, name: 'Embed Links', does: 'Links they send show a preview.' },
            { key: 'AttachFiles', bit: 1n << 15n, name: 'Attach Files', does: 'Upload files and pictures.' },
            { key: 'AddReactions', bit: 1n << 6n, name: 'Add Reactions', does: 'React to messages with emoji.' },
            { key: 'UseExternalEmojis', bit: 1n << 18n, name: 'Use External Emoji', does: 'Use emoji from other servers.' },
            { key: 'UseExternalStickers', bit: 1n << 37n, name: 'Use External Stickers', does: 'Use stickers from other servers.' },
            { key: 'MentionEveryone', bit: 1n << 17n, name: 'Mention @everyone, @here and All Roles', does: 'Ping everyone or any role.' },
            { key: 'ManageMessages', bit: 1n << 13n, name: 'Manage Messages', does: 'Delete other people’s messages.' },
            { key: 'PinMessages', bit: 1n << 51n, name: 'Pin Messages', does: 'Pin and unpin messages.' },
            { key: 'ManageThreads', bit: 1n << 34n, name: 'Manage Threads', does: 'Rename, lock, archive or delete threads.' },
            { key: 'ReadMessageHistory', bit: 1n << 16n, name: 'Read Message History', does: 'See messages sent before they were let in.' },
            { key: 'SendTTSMessages', bit: 1n << 12n, name: 'Send Text-to-Speech Messages', does: 'Send /tts messages.' },
            { key: 'SendVoiceMessages', bit: 1n << 46n, name: 'Send Voice Messages', does: 'Record and send voice messages.' },
            { key: 'SendPolls', bit: 1n << 49n, name: 'Create Polls', does: 'Start polls.' },
        ],
    },
    {
        name: 'Apps permissions',
        perms: [
            { key: 'UseApplicationCommands', bit: 1n << 31n, name: 'Use Application Commands', does: 'Use slash commands and app menus.' },
            { key: 'UseEmbeddedActivities', bit: 1n << 39n, name: 'Use Activities', does: 'Start activities here.' },
            { key: 'UseExternalApps', bit: 1n << 50n, name: 'Use External Apps', does: 'Apps they added to their account post visibly.' },
        ],
    },
];

export const CHANNEL_PERMISSIONS: readonly ChannelPermissionInfo[] = CHANNEL_PERMISSION_GROUPS.flatMap((g) => g.perms);
export type ChannelPermissionKey = string;

/** Discord's three states for one permission in a channel: ✕ denied, / unset (falls back to the server), ✓ allowed. */
export type PermState = 'deny' | 'inherit' | 'allow';

/** One target's overwrite: only the permissions set to allow or deny are listed. */
export type PermOverwrite = Partial<Record<ChannelPermissionKey, 'allow' | 'deny'>>;

/** The overwrites for one state of the ticket. */
export interface PermissionSet {
    /** The built-in targets. */
    targets: Record<TicketTarget, PermOverwrite>;
    /** Any other role, by id. */
    roles: Record<Snowflake, PermOverwrite>;
}

/** The channel's permissions while the ticket is open, and once it is closed. */
export interface TicketPermissions {
    open: PermissionSet;
    closed: PermissionSet;
    /** While open and claimed: used instead of `open` when `useClaimed` is on (e.g. only the claimer may write). */
    claimed: PermissionSet;
    useClaimed: boolean;
}

/* ------------------------------------------------------------------ the ticket controls */

/** What can be done to a ticket. The first group sits on the open ticket's message; the second on the closed message. */
export const TICKET_ACTIONS = ['close', 'claim', 'rename', 'add', 'remove', 'transfer', 'transcript', 'come', 'sleep', 'reopen', 'delete'] as const;
export type TicketAction = (typeof TICKET_ACTIONS)[number];
export const OPEN_ACTIONS: readonly TicketAction[] = ['close', 'claim', 'rename', 'add', 'remove', 'transfer', 'transcript', 'come', 'sleep'];
/** Come and Sleep: who may use them and their messages are set on their own pages, not on the button. */
export const PAGE_ACTIONS: readonly TicketAction[] = ['come', 'sleep'];
export const CLOSED_ACTIONS: readonly TicketAction[] = ['reopen', 'transcript', 'delete'];

export const TICKET_ACTION_INFO: Record<TicketAction, { name: string; does: string; command: string; locked?: boolean }> = {
    close: { name: 'Close', does: 'Closes the ticket and saves the transcript.', command: 'close', locked: true },
    claim: { name: 'Claim', does: 'A staff member takes the ticket. Press again to unclaim.', command: 'claim' },
    rename: { name: 'Rename', does: 'Changes the channel name.', command: 'rename' },
    add: { name: 'Add member', does: 'Lets another member into the ticket.', command: 'add' },
    remove: { name: 'Remove member', does: 'Takes a member out of the ticket.', command: 'remove' },
    transfer: { name: 'Transfer', does: 'Gives the ticket to another staff member.', command: 'transfer' },
    transcript: { name: 'Transcript', does: 'Saves the conversation so far and sends the link.', command: 'transcript' },
    come: { name: 'Come', does: 'Calls the ticket owner back with a direct message.', command: 'come' },
    sleep: { name: 'Sleep', does: 'Reminds the owner now and starts the sleep countdown.', command: 'sleep' },
    reopen: { name: 'Reopen', does: 'Opens a closed ticket again.', command: 'reopen' },
    delete: { name: 'Delete', does: 'Deletes the channel (the transcript stays).', command: 'delete' },
};

export interface TicketControlItem extends TicketWho {
    /** Close can't be hidden; everything else can (its command still works for who may use it). */
    shown: boolean;
    label: string;
    emoji: string;
    style: TicketButtonStyle;
    /** Menu only: the small line under the label. */
    description: string;
    /** Ask "are you sure?" first (Close, Delete). */
    confirm: boolean;
    /** Close: ask for a reason in a popup. */
    reason: boolean;
    /** What the bot says in the ticket after it's done; empty: the built-in line in the server's language. */
    notice: string;
    /** Delete: seconds before the channel goes. */
    delay: number;
    /** On the open ticket's message: a button, or an entry in its menu. */
    placement: ItemPlacement;
    /** On the closed message (Reopen, Transcript, Delete): set apart from the open ticket's. */
    closedPlacement: ItemPlacement;
    /** What the bot posts after it: the one-line `notice` (text), or a designed message (embed or components). */
    noticeStyle: 'text' | 'design';
    noticeDesign: MessageDesign;
    /** Close, Delete: the "are you sure?" as plain text (the server's close confirmation / built-in line) or designed. */
    confirmStyle: 'text' | 'design';
    confirmDesign: MessageDesign;
}

export interface TicketControls {
    /** The open ticket's menu (controls and info buttons placed in the menu). */
    placeholder: string;
    /** The closed message's menu. */
    closedPlaceholder: string;
    items: Record<TicketAction, TicketControlItem>;
}

/** Which settings each control has, in its settings popup. */
export const ACTION_SETTINGS: Record<TicketAction, readonly ('confirm' | 'reason' | 'notice' | 'delay' | 'closedMessage')[]> = {
    close: ['confirm', 'reason', 'closedMessage'],
    claim: ['notice'],
    rename: ['notice'],
    add: ['notice'],
    remove: ['notice'],
    transfer: ['notice'],
    transcript: ['notice'],
    come: [],
    sleep: [],
    reopen: ['notice'],
    delete: ['confirm', 'delay', 'notice'],
};

/* ------------------------------------------------------------------ the form before a ticket opens */

/** What a question asks for, with Discord's new popup parts (labels, menus, radio buttons, checkboxes, uploads). */
export const QUESTION_KINDS = [
    ['short', 'Short answer', 'One line of text.'],
    ['paragraph', 'Paragraph', 'A longer text answer.'],
    ['select', 'Menu', 'Pick from a dropdown.'],
    ['radio', 'Radio buttons', 'Pick exactly one.'],
    ['checkboxes', 'Checkboxes', 'Tick any of them.'],
    ['checkbox', 'Yes / no', 'One checkbox.'],
    ['user', 'Member', 'Pick a member of the server.'],
    ['role', 'Role', 'Pick a role.'],
    ['file', 'File upload', 'Upload files or pictures.'],
] as const;
export type QuestionKind = (typeof QUESTION_KINDS)[number][0];
export const CHOICE_KINDS: readonly QuestionKind[] = ['select', 'radio', 'checkboxes'];
export const TEXT_QUESTION_KINDS: readonly QuestionKind[] = ['short', 'paragraph'];

export interface TicketChoice { id: string; label: string; description: string }

export interface TicketQuestion {
    id: string;
    kind: QuestionKind;
    label: string;
    /** The small line under the question. */
    description: string;
    /** Text and menus: the hint inside the box. */
    placeholder: string;
    required: boolean;
    /** Text: characters. Menus, checkboxes, members, roles, files: how many may be picked. */
    min: number;
    max: number;
    /** Menu, radio buttons and checkboxes. */
    choices: TicketChoice[];
}

/* ------------------------------------------------------------------ where things go (cascading) */

/** Each of these is the option's own choice, else its panel's, else the server's. */
export interface TicketPlaces {
    /** Where new tickets are made. */
    categoryId: Snowflake | null;
    /** Where a closed ticket is moved (none: it stays where it is). */
    closedCategoryId: Snowflake | null;
    /** Opens, claims, closes and deletes. */
    logChannelId: Snowflake | null;
    /** Transcripts of closed tickets. */
    transcriptChannelId: Snowflake | null;
}
export const PLACE_KEYS = ['categoryId', 'closedCategoryId', 'logChannelId', 'transcriptChannelId'] as const;
export type PlaceKey = (typeof PLACE_KEYS)[number];
export const PLACE_INFO: Record<PlaceKey, { name: string; none: string; category: boolean }> = {
    categoryId: { name: 'Ticket category', none: 'Top of the channel list', category: true },
    closedCategoryId: { name: 'Closed category', none: 'Stays where it is', category: true },
    logChannelId: { name: 'Log channel', none: 'No log', category: false },
    transcriptChannelId: { name: 'Transcript channel', none: 'No transcript post', category: false },
};

/* ------------------------------------------------------------------ after a ticket closes */

/**
 * What happens around closing and deleting. The server sets defaults (Settings); each ticket option can use them or set
 * its own (null = use the server's).
 */
export interface TicketLifecycle {
    /** Save the transcript again when the ticket is deleted (so it has everything said after it closed). */
    transcriptOnDelete: boolean;
    /** Delete a closed ticket this many seconds after it closed; 0 = never (only the Delete control). */
    autoDeleteSeconds: number;
    /** The "are you sure?" when closing; empty = the built-in line in the server's language. */
    closeConfirm: string;
}

/** Pictures in tickets: Robtic's own rule, the same everywhere (kept small: transcripts keep every picture). */
export const TICKET_PICTURES = { perTicket: 1, maxMB: 8 } as const;

export type TicketLifecycleOverride = { [K in keyof TicketLifecycle]: TicketLifecycle[K] | null };

export const defaultLifecycle = (): TicketLifecycle => ({ transcriptOnDelete: true, autoDeleteSeconds: 0, closeConfirm: '' });
export const inheritLifecycle = (): TicketLifecycleOverride => ({ transcriptOnDelete: null, autoDeleteSeconds: null, closeConfirm: null });

/** An option's own choice, else the server's. */
export function resolveLifecycle(g: TicketGeneral, o: TicketOption | null): TicketLifecycle {
    const own = o?.lifecycle ?? inheritLifecycle();
    return {
        transcriptOnDelete: own.transcriptOnDelete ?? g.lifecycle.transcriptOnDelete,
        autoDeleteSeconds: own.autoDeleteSeconds ?? g.lifecycle.autoDeleteSeconds,
        closeConfirm: own.closeConfirm ?? g.lifecycle.closeConfirm,
    };
}

/** "45 seconds", "5 minutes", "2 hours", "3 days": for the dashboard and the bot's notice. */
export function durationText(seconds: number, lang: TicketLanguage = 'en'): string {
    const units: [number, string, string][] = [[86_400, 'day', 'يوم'], [3_600, 'hour', 'ساعة'], [60, 'minute', 'دقيقة'], [1, 'second', 'ثانية']];
    const [size, en, ar] = units.find(([u]) => seconds >= u && seconds % u === 0) ?? units[3]!;
    const n = Math.round(seconds / size);
    return lang === 'ar' ? `${n} ${ar}` : `${n} ${en}${n === 1 ? '' : 's'}`;
}

/* ------------------------------------------------------------------ options and panels */

export interface TicketOption extends TicketPlaces {
    id: string;
    /** As a button: its label; as a menu option: its title. */
    label: string;
    emoji: string;
    /** Menu only. */
    description: string;
    /** Buttons only. */
    style: TicketButtonStyle;
    /** Turned off: the option stays on the panel but answers that it's closed for now. */
    enabled: boolean;
    /** A button, or an entry in the panel's menu. */
    placement: ItemPlacement;

    /** The ticket channel's name: {number} {username} {option}. */
    channelName: string;
    supportRoleIds: Snowflake[];
    managerRoleIds: Snowflake[];
    /** Open tickets one member may have from this option at once; 0 = no limit. */
    perMember: number;
    /** Questions asked in a popup before the ticket opens (none = it opens straight away). */
    questions: TicketQuestion[];

    /** What the bot posts in the new ticket, with the ticket controls in it. */
    welcome: MessageDesign;
    /** What the bot posts when the ticket closes, with the closed controls (Reopen, Transcript, Delete) in it. */
    closed: MessageDesign;
    permissions: TicketPermissions;
    controls: TicketControls;
    /** Transcript on delete, auto-delete, close confirmation: this option's own, or the server's (null). */
    lifecycle: TicketLifecycleOverride;
}

export interface TicketPanel extends TicketPlaces {
    id: string;
    name: string;
    /** Where the panel is posted. */
    channelId: Snowflake | null;
    message: MessageDesign;
    /** Every ticket option as a button, or all in one menu (a panel is one or the other). */
    display: 'buttons' | 'menu';
    /** The menu's placeholder. */
    placeholder: string;
    /** Members with these roles can't open tickets here (added to the server's list). */
    blacklistRoleIds: Snowflake[];
    options: TicketOption[];
    /** Button panels only: info buttons beside the ticket buttons (each shows one of the server's info panels). */
    infoButtons: TicketInfoItem[];
    posted: { channelId: Snowflake; messageId: Snowflake; at: string } | null;
}

export interface TicketGeneral extends TicketPlaces {
    /** The language the bot answers in, on this server. */
    language: TicketLanguage;
    /** Text commands: !close, !rename… (slash commands always work). */
    prefix: string;
    /** Also send the owner the transcript in a DM. */
    transcriptToOwner: boolean;
    /** Members with these roles can't open tickets on any panel. */
    blacklistRoleIds: Snowflake[];
    /** Tickets are numbered from here. */
    nextNumber: number;
    /** Robtic Staff points for the staff member who claims a ticket (sent to Robtic Staff's points API; needs Robtic
     *  Staff in the server, and only counts for its staff). */
    staffPoints: { enabled: boolean; perClaim: number };
    /** Defaults for every ticket option: transcript on delete, auto-delete after closing, the close confirmation. */
    lifecycle: TicketLifecycle;
    /** The message posted in the transcript channel with each transcript. */
    transcriptPost: TranscriptMessage;
    /** The direct message to the owner with the transcript (when transcriptToOwner). */
    dmTranscript: TranscriptMessage;
}

/** How a transcript is sent: plain text or a designed message, with or without the HTML file and a link button. */
export interface TranscriptMessage {
    style: 'text' | 'design';
    /** Text style: {number} {channel} {server} {link}. */
    text: string;
    /** Design style: an embed or components; the button sits in its slot. */
    design: MessageDesign;
    /** Attach the transcript as an HTML file. */
    attachFile: boolean;
    /** A link button to the transcript page. */
    button: { show: boolean; label: string; emoji: string };
}

/* ------------------------------------------------------------------ sleep: an owner who stopped answering */

/**
 * Ticket sleep: when the last message in a ticket isn't the owner's (staff answered, the owner went quiet), after
 * `reminderMinutes` the bot reminds them (in the ticket and by direct message), and after `closeMinutes` it closes the
 * ticket. /sleep (!خمول) sends the reminder now and starts the countdown, even with the automatic one off.
 */
export interface TicketSleep extends TicketWho {
    enabled: boolean;
    reminderMinutes: number;
    closeMinutes: number;
    /** Posted in the ticket: {user} {staff} {time} and the ticket's words. */
    ticketMessage: MessageDesign;
    /** Sent to the owner: the slot is a "Go to the ticket" link. */
    dmMessage: MessageDesign;
}

/* ------------------------------------------------------------------ !come */

/** !come: a staff member calls the ticket owner (or a member) back to the ticket with a direct message. */
export interface TicketCome extends TicketWho {
    enabled: boolean;
    /** Minutes before it can be used again in the same ticket. */
    cooldown: number;
    /** The direct message; its slot is the "Go to the ticket" link button. */
    message: MessageDesign;
    button: { label: string; emoji: string };
    /** Said in the ticket once the message is sent; empty: the built-in line. */
    notice: string;
}

/* ------------------------------------------------------------------ commands */

export const TICKET_COMMANDS = TICKET_ACTIONS;
export type TicketCommand = (typeof TICKET_COMMANDS)[number];
export const TICKET_COMMAND_INFO: Record<TicketCommand, { does: string; ar: string; args?: string }> = {
    close: { does: 'Close the ticket', ar: 'اغلاق', args: '[reason]' },
    claim: { does: 'Claim it (again to unclaim)', ar: 'استلام' },
    rename: { does: 'Rename the channel', ar: 'تسمية', args: '<name>' },
    add: { does: 'Add a member', ar: 'اضافة', args: '<@member>' },
    remove: { does: 'Remove a member', ar: 'ازالة', args: '<@member>' },
    transfer: { does: 'Give it to another staff member', ar: 'تحويل', args: '<@member>' },
    transcript: { does: 'Save the transcript now', ar: 'نسخة' },
    reopen: { does: 'Reopen a closed ticket', ar: 'فتح' },
    delete: { does: 'Delete the channel', ar: 'حذف' },
    come: { does: 'Call the owner back with a direct message', ar: 'تعال', args: '[@member]' },
    sleep: { does: 'Remind the owner now and start the sleep countdown', ar: 'خمول' },
};

export interface TicketCommandSetting {
    /** Off: the typed command and the slash command both answer that it's turned off. Buttons still work. */
    enabled: boolean;
    /**
     * Every word that runs the typed command (after the prefix). Starts as the English and Arabic names; the server
     * can remove them or add its own. Empty: only the slash command.
     */
    aliases: string[];
    /** Set once `aliases` holds the whole list. Older documents only kept extra words: the names are added on load. */
    words?: true;
}

/** The typed words a command starts with: its English name and its Arabic spellings (the bot's built-in words). */
const EXTRA_AR: Partial<Record<TicketCommand, string[]>> = { close: ['إغلاق', 'قفل'], add: ['إضافة'], remove: ['إزالة'], come: ['استدعاء'] };
export const defaultCommandWords = (c: TicketCommand): string[] => [c, TICKET_COMMAND_INFO[c].ar, ...(EXTRA_AR[c] ?? [])];

export interface TicketSettings {
    general: TicketGeneral;
    sleep: TicketSleep;
    panels: TicketPanel[];
    come: TicketCome;
    commands: Record<TicketCommand, TicketCommandSetting>;
    /** Panels shown by info buttons (or posted in a channel): Robtic System's panel builder. */
    infoPanels: Panel[];
    /** The bot's look in this server (saved to Discord itself, not the bot's database). */
    profile: BotProfile;
}

export type TicketSectionKey = keyof TicketSettings;

/* ------------------------------------------------------------------ templates */

/** A saved panel anyone can reuse: on another server, or shared with another person by its code. */
export interface TicketTemplate {
    id: string;
    name: string;
    description: string;
    panel: TicketPanel;
    ownerId: string;
    ownerName: string;
    /** The server it was made on (its channels and roles only mean something there). */
    guildId: string;
    /** Give this to someone and they can add the template to theirs. */
    shareCode: string;
    createdAt: string;
    /** For the viewer: their own, or shared with them. */
    mine: boolean;
    /** 'link': only people with its link or code. 'public': also listed in the public templates. */
    visibility: TemplateVisibility;
    /** For search in the public templates. */
    tags: string[];
    /** People who liked it (one each) and who used it on a server (one each). */
    likes: number;
    clones: number;
    /** The viewer liked it. */
    liked: boolean;
}

export type TemplateVisibility = 'link' | 'public';

/** A template as anyone sees it: on its share page and in the public templates. */
export interface TemplateCard {
    code: string;
    name: string;
    description: string;
    tags: string[];
    ownerName: string;
    ownerAvatar: string | null;
    visibility: TemplateVisibility;
    likes: number;
    clones: number;
    liked: boolean;
    createdAt: string;
    format: MessageDesign['format'];
    display: 'buttons' | 'menu';
    options: { label: string; emoji: string; description: string }[];
}

/** The share page: the card and the panel itself, for the preview. */
export interface TemplateView extends TemplateCard {
    panel: TicketPanel;
}

export interface TemplatePage {
    items: TemplateCard[];
    total: number;
    /** The most used tags among public templates, for the filter chips. */
    tags: { tag: string; count: number }[];
}

export const TEMPLATE_LIMITS = { tags: 5, tag: 20, description: 200, publicDescriptionMin: 10 } as const;
export const TEMPLATE_SORTS = [['likes', 'Most liked'], ['clones', 'Most used'], ['new', 'Newest']] as const;
export type TemplateSort = (typeof TEMPLATE_SORTS)[number][0];

/** A tag as stored: lower case, letters, numbers and dashes, at most 20 characters. */
export const cleanTag = (t: string) => t.trim().toLowerCase().replace(/^#/, '').replace(/\s+/g, '-').replace(/[^\p{L}\p{N}-]/gu, '').slice(0, TEMPLATE_LIMITS.tag);

/** What a public template needs: a name, a description people can read, and at least one tag to be found by. */
export function templateSharingErrors(s: { visibility: TemplateVisibility; name: string; description: string; tags: string[] }): string[] {
    const out: string[] = [];
    if (!s.name.trim()) out.push('Give the template a name.');
    if (s.description.length > TEMPLATE_LIMITS.description) out.push(`The description is over ${TEMPLATE_LIMITS.description} characters.`);
    if (s.tags.length > TEMPLATE_LIMITS.tags) out.push(`At most ${TEMPLATE_LIMITS.tags} tags.`);
    if (s.visibility === 'public') {
        if (s.description.trim().length < TEMPLATE_LIMITS.publicDescriptionMin) out.push('A public template needs a description (a sentence or two), so people know what it is.');
        if (!s.tags.length) out.push('Add at least one tag, so people can find it.');
    }
    return out;
}

/** The share page's address. */
export const templateUrl = (origin: string, code: string) => `${origin}/discord/public/templates/${encodeURIComponent(code)}`;

/* ------------------------------------------------------------------ transcripts */

/** A saved transcript, as the dashboard lists it. */
export interface TicketTranscriptSummary {
    id: string;
    ticketNumber: number;
    channelName: string;
    panelName: string;
    optionLabel: string;
    ownerId: string;
    ownerName: string;
    claimerId: string | null;
    claimerName: string | null;
    messageCount: number;
    openedAt: string;
    closedAt: string;
    /** The viewer's address. */
    url: string;
    /** Anyone with the link may open it (a server administrator turned this on). Otherwise: the server's
     *  administrators, and the ticket's owner when the server sends owners their transcript. */
    public: boolean;
}

/** One transcript for the transcript page, after the access check (GET /discord/api/ticket/transcript/:id). */
export interface TranscriptView {
    /** The transcript document the page renders; null in local mock mode (the page then shows its own sample). */
    doc: unknown | null;
    public: boolean;
    /** The viewer is an administrator of the transcript's server (or a Robtic super user): may make it public. */
    canShare: boolean;
}

/** A transcript's public id, as the bot makes them. */
export const TRANSCRIPT_ID = /^[A-Za-z0-9_]{1,64}$/;

export interface TranscriptFilter {
    /** Words in the channel name, the option, the number or a name. */
    q?: string;
    ownerId?: string;
    claimerId?: string;
    option?: string;
    /** ISO dates, closed between. */
    from?: string;
    to?: string;
}

export interface TranscriptPage {
    items: TicketTranscriptSummary[];
    total: number;
    /** For the filters: everyone who opened or claimed a ticket, and every option. */
    owners: { id: string; name: string }[];
    claimers: { id: string; name: string }[];
    options: string[];
}

export interface TicketOverview {
    open: number;
    closedThisWeek: number;
    transcripts: TicketTranscriptSummary[];
}

/* ------------------------------------------------------------------ defaults */

export const ticketEmbed = (over: Partial<PanelEmbed> = {}): PanelEmbed => ({
    color: '#1793ff', author: '', title: '', url: '', description: '', fields: [], thumbnail: '', image: '', footer: '', ...over,
});

const NOTICE_WORDS: Partial<Record<string, string>> = {
    Claim: '{staff} claimed this ticket.', Rename: '{staff} renamed the ticket to {name}.', Add: '{staff} added {member} to the ticket.',
    Remove: '{staff} removed {member} from the ticket.', Transfer: '{staff} gave the ticket to {member}.', Transcript: 'Transcript saved.',
    Reopen: '{staff} reopened the ticket.', Delete: 'This ticket will be deleted in a few seconds.', Close: '{staff} closed the ticket.',
};
const CONFIRM_WORDS: Partial<Record<string, string>> = { Close: 'Close this ticket?', Delete: 'Delete this ticket? This can’t be undone.' };

const item = (label: string, emoji: string, style: TicketButtonStyle, who: TicketTarget[], description = '', more: Partial<TicketControlItem> = {}): TicketControlItem => ({
    shown: true, label, emoji, style, description, who, roleIds: [], confirm: false, reason: false, notice: '', delay: 0, placement: 'button', closedPlacement: 'button',
    noticeStyle: 'text', noticeDesign: simpleDesign(NOTICE_WORDS[label] ?? '{staff} used {option}.'),
    confirmStyle: 'text', confirmDesign: simpleDesign(CONFIRM_WORDS[label] ?? 'Are you sure?', label === 'Delete' ? '#da373c' : '#1793ff'),
    ...more,
});

export const defaultTicketControls = (): TicketControls => ({
    placeholder: 'Ticket options',
    closedPlaceholder: 'Closed ticket options',
    items: {
        close: item('Close', '🔒', 'danger', ['owner', 'claimer', 'support', 'manager'], 'Close this ticket', { confirm: true }),
        claim: item('Claim', '🙋', 'success', ['support', 'manager'], 'Take this ticket'),
        rename: item('Rename', '✏️', 'secondary', ['claimer', 'manager'], 'Change the channel name'),
        add: item('Add', '➕', 'secondary', ['claimer', 'support', 'manager'], 'Let a member in'),
        remove: item('Remove', '➖', 'secondary', ['claimer', 'manager'], 'Take a member out'),
        transfer: item('Transfer', '🔁', 'secondary', ['claimer', 'manager'], 'Give it to another staff member', { shown: false }),
        transcript: item('Transcript', '📄', 'secondary', ['claimer', 'support', 'manager'], 'Save the conversation'),
        // Hidden until a server shows them; who may use them is set on the Come and Sleep pages.
        come: item('Come', '📣', 'secondary', ['claimer', 'support', 'manager'], 'Call the owner back', { shown: false }),
        sleep: item('Sleep', '💤', 'secondary', ['claimer', 'support', 'manager'], 'Remind the owner', { shown: false }),
        reopen: item('Reopen', '🔓', 'success', ['claimer', 'support', 'manager'], 'Open it again'),
        delete: item('Delete', '🗑️', 'danger', ['manager'], 'Delete the channel', { confirm: true, delay: 5 }),
    },
});

const VIEW_WRITE: PermOverwrite = { ViewChannel: 'allow', SendMessages: 'allow', ReadMessageHistory: 'allow', AttachFiles: 'allow', EmbedLinks: 'allow' };
const VIEW_ONLY: PermOverwrite = { ViewChannel: 'allow', SendMessages: 'deny', ReadMessageHistory: 'allow' };

export const emptyTargets = (): Record<TicketTarget, PermOverwrite> => ({ everyone: {}, owner: {}, claimer: {}, added: {}, support: {}, manager: {} });

export const defaultTicketPermissions = (): TicketPermissions => ({
    open: {
        targets: {
            everyone: { ViewChannel: 'deny' },
            owner: { ...VIEW_WRITE },
            claimer: { ...VIEW_WRITE, ManageMessages: 'allow' },
            added: { ...VIEW_WRITE },
            support: { ...VIEW_WRITE },
            manager: { ...VIEW_WRITE, ManageMessages: 'allow', ManageChannels: 'allow' },
        },
        roles: {},
    },
    closed: {
        targets: {
            everyone: { ViewChannel: 'deny' },
            owner: { ...VIEW_ONLY },
            claimer: { ...VIEW_WRITE, ManageMessages: 'allow' },
            added: { ...VIEW_ONLY },
            support: { ...VIEW_WRITE },
            manager: { ...VIEW_WRITE, ManageMessages: 'allow', ManageChannels: 'allow' },
        },
        roles: {},
    },
    // Claimed: like open, except other support staff only read (the claimer handles it). Off until turned on.
    claimed: {
        targets: {
            everyone: { ViewChannel: 'deny' },
            owner: { ...VIEW_WRITE },
            claimer: { ...VIEW_WRITE, ManageMessages: 'allow' },
            added: { ...VIEW_WRITE },
            support: { ...VIEW_ONLY },
            manager: { ...VIEW_WRITE, ManageMessages: 'allow', ManageChannels: 'allow' },
        },
        roles: {},
    },
    useClaimed: false,
});

export const defaultWelcome = (): MessageDesign => ({
    format: 'embed',
    content: '{user} {support}',
    embed: ticketEmbed({
        title: '{option}',
        description: 'Thanks for reaching out, {user}. Tell us what you need and a member of the team will answer soon.\n\nUse the buttons below to manage this ticket.',
    }),
    accent: '#1793ff',
    blocks: [
        { id: panelId('t'), type: 'text', content: '## {option}\nThanks for reaching out, {user}. Tell us what you need and a member of the team will answer soon.' },
        { id: panelId('s'), type: 'separator', divider: true, spacing: 1 },
        { id: SLOT_ID, type: 'slot' },
    ],
});

export const defaultClosedMessage = (): MessageDesign => ({
    format: 'embed',
    content: '',
    embed: ticketEmbed({ color: '#da373c', title: '🔒 Ticket closed', description: 'Closed by {closer}.\n**Reason:** {reason}' }),
    accent: '#da373c',
    blocks: [
        { id: panelId('t'), type: 'text', content: '### 🔒 Ticket closed\nClosed by {closer}.\n**Reason:** {reason}' },
        { id: SLOT_ID, type: 'slot' },
    ],
});

export const defaultComeMessage = (): MessageDesign => ({
    format: 'embed',
    content: '',
    embed: ticketEmbed({ title: '📣 You’re needed in your ticket', description: '{staff} from **{server}** is waiting for you in your ticket #{number}.' }),
    accent: '#1793ff',
    blocks: [
        { id: panelId('t'), type: 'text', content: '### 📣 You’re needed in your ticket\n{staff} from **{server}** is waiting for you in your ticket #{number}.' },
        { id: SLOT_ID, type: 'slot' },
    ],
});

export const defaultCome = (): TicketCome => ({
    enabled: true,
    who: ['claimer', 'support', 'manager'],
    roleIds: [],
    cooldown: 10,
    message: defaultComeMessage(),
    button: { label: 'Go to the ticket', emoji: '🎫' },
    notice: '',
});

export const defaultCommands = (): Record<TicketCommand, TicketCommandSetting> =>
    Object.fromEntries(TICKET_COMMANDS.map((c) => [c, { enabled: true, aliases: defaultCommandWords(c), words: true }])) as unknown as Record<TicketCommand, TicketCommandSetting>;

export const noPlaces = (): TicketPlaces => ({ categoryId: null, closedCategoryId: null, logChannelId: null, transcriptChannelId: null });

export function newTicketOption(label = 'Support', emoji = '🎫'): TicketOption {
    return {
        id: panelId('o'),
        label,
        emoji,
        description: '',
        style: 'primary',
        enabled: true,
        placement: 'button',
        ...noPlaces(),
        channelName: 'ticket-{number}',
        supportRoleIds: [],
        managerRoleIds: [],
        perMember: 1,
        questions: [],
        welcome: defaultWelcome(),
        closed: defaultClosedMessage(),
        permissions: defaultTicketPermissions(),
        controls: defaultTicketControls(),
        lifecycle: inheritLifecycle(),
    };
}

export function newTicketPanel(name = 'Support'): TicketPanel {
    return {
        id: panelId('p'),
        name,
        channelId: null,
        ...noPlaces(),
        message: {
            format: 'embed',
            content: '',
            embed: ticketEmbed({ title: 'Need help?', description: 'Pick what your ticket is about and a private channel opens for you and the team.' }),
            accent: '#1793ff',
            blocks: [
                { id: panelId('t'), type: 'text', content: '## Need help?\nPick what your ticket is about and a private channel opens for you and the team.' },
                { id: SLOT_ID, type: 'slot' },
            ],
        },
        display: 'buttons',
        placeholder: 'What is your ticket about?',
        blacklistRoleIds: [],
        options: [newTicketOption('Support', '🎫')],
        infoButtons: [],
        posted: null,
    };
}

export const newChoice = (label = 'Choice'): TicketChoice => ({ id: panelId('c'), label, description: '' });

export const newQuestion = (kind: QuestionKind = 'paragraph'): TicketQuestion => {
    const base: TicketQuestion = { id: panelId('q'), kind, label: 'What do you need help with?', description: '', placeholder: '', required: true, min: 0, max: 1000, choices: [] };
    switch (kind) {
        case 'short': return { ...base, label: 'Your answer', max: 100 };
        case 'paragraph': return base;
        case 'select': return { ...base, label: 'Pick one', min: 1, max: 1, choices: [newChoice('First'), newChoice('Second')] };
        case 'radio': return { ...base, label: 'Pick one', min: 1, max: 1, choices: [newChoice('Yes'), newChoice('No')] };
        case 'checkboxes': return { ...base, label: 'Tick what applies', required: false, min: 0, max: 2, choices: [newChoice('First'), newChoice('Second')] };
        case 'checkbox': return { ...base, label: 'I have read the rules', min: 0, max: 1 };
        case 'user': return { ...base, label: 'Which member?', min: 1, max: 1 };
        case 'role': return { ...base, label: 'Which role?', min: 1, max: 1 };
        case 'file': return { ...base, label: 'Screenshots', required: false, min: 0, max: 3 };
    }
};

export const newMessageBlock = (kind: MessageBlockKind, infoPanel?: { id: string; name: string }): MessageBlock => {
    switch (kind) {
        case 'info': return newInfoBlock(infoPanel?.id ?? '', infoPanel?.name || 'Info');
        case 'text': return { id: panelId('t'), type: 'text', content: '' };
        case 'thumbText': return { id: panelId('h'), type: 'thumbText', content: '', thumbnail: '' };
        case 'image': return { id: panelId('i'), type: 'image', url: '' };
        case 'separator': return { id: panelId('s'), type: 'separator', divider: true, spacing: 1 };
    }
};

export const defaultDmTranscript = (): TranscriptMessage => ({
    style: 'design',
    text: '📄 The transcript of your ticket **#{number}** in **{server}**: {link}',
    design: {
        ...simpleDesign('Here is the transcript of your ticket **#{number}** in **{server}**.'),
        embed: { color: '#1793ff', author: '{server}', title: '📄 Your ticket transcript', url: '', description: 'Here is the transcript of your ticket **#{number}** ({channel}).\nOpen it any time with the button below.', fields: [], thumbnail: '', image: '', footer: '' },
    },
    attachFile: true,
    button: { show: true, label: 'Open the transcript', emoji: '📄' },
});

export const defaultTranscriptPost = (): TranscriptMessage => ({
    style: 'text',
    text: '📄 Transcript of **#{channel}**: {link}',
    design: { ...simpleDesign('📄 Transcript of **#{channel}** (ticket #{number}).'), embed: { color: '#1793ff', author: '', title: '📄 Ticket #{number}', url: '', description: 'The transcript of **#{channel}**.', fields: [], thumbnail: '', image: '', footer: '' } },
    attachFile: true,
    button: { show: true, label: 'Open', emoji: '📄' },
});

/** Older documents kept the DM as a bare design: that becomes the design style, file and button on. */
function normalizeTranscriptMessage(x: unknown, d: TranscriptMessage): TranscriptMessage {
    const o = obj(x);
    if (typeof o.format === 'string') return { ...d, style: 'design', design: o as unknown as MessageDesign };
    if (!o.style) return d;
    return { ...d, ...(o as Partial<TranscriptMessage>), button: { ...d.button, ...obj(o.button) } };
}

export const defaultSleep = (): TicketSleep => ({
    enabled: false,
    reminderMinutes: 60,
    closeMinutes: 1440,
    who: ['claimer', 'support', 'manager'],
    roleIds: [],
    ticketMessage: { ...simpleDesign('{user}, we’re waiting for your answer. This ticket closes in {time} if there’s no reply.', '#f0b232'), content: '{user}' },
    dmMessage: simpleDesign('Your ticket **#{number}** in **{server}** is waiting for your answer. It closes in {time} if there’s no reply.', '#f0b232'),
});

export const defaultTicketSettings = (): TicketSettings => ({
    general: { language: 'en', prefix: '!', ...noPlaces(), transcriptToOwner: true, blacklistRoleIds: [], nextNumber: 1, staffPoints: { enabled: true, perClaim: 1 }, lifecycle: defaultLifecycle(), transcriptPost: defaultTranscriptPost(), dmTranscript: defaultDmTranscript() },
    sleep: defaultSleep(),
    panels: [],
    come: defaultCome(),
    commands: defaultCommands(),
    infoPanels: [],
    profile: defaultProfile(),
});

/* ------------------------------------------------------------------ older documents → this shape */

type Loose = Record<string, unknown>;
const obj = (x: unknown): Loose => (x && typeof x === 'object' && !Array.isArray(x) ? (x as Loose) : {});
const arr = <T>(x: unknown): T[] => (Array.isArray(x) ? (x as T[]) : []);

function normalizeSet(x: unknown, fallback: PermissionSet): PermissionSet {
    const s = obj(x);
    if (!s.targets) return fallback;
    return { targets: { ...emptyTargets(), ...(obj(s.targets) as Record<TicketTarget, PermOverwrite>) }, roles: obj(s.roles) as Record<string, PermOverwrite> };
}

/** Permissions saved before open/closed were split ({ targets, roles, closedOwner }) become both sets. */
function normalizePermissions(x: unknown): TicketPermissions {
    const p = obj(x);
    const d = defaultTicketPermissions();
    const claimedOf = (open: PermissionSet) => (p.claimed ? normalizeSet(p.claimed, d.claimed) : { ...d.claimed, roles: cloneJson(open.roles) });
    if (p.open || p.closed) {
        const open = normalizeSet(p.open, d.open);
        return { open, closed: normalizeSet(p.closed, d.closed), claimed: claimedOf(open), useClaimed: p.useClaimed === true };
    }
    if (!p.targets) return d;
    const open = normalizeSet(p, d.open);
    const shut: PermOverwrite = p.closedOwner === 'hidden' ? { ViewChannel: 'deny' } : { ...VIEW_ONLY };
    return { open, closed: { targets: { ...cloneJson(open.targets), owner: shut, added: shut }, roles: cloneJson(open.roles) }, claimed: claimedOf(open), useClaimed: false };
}

const placementOf = (x: unknown, fallback: ItemPlacement): ItemPlacement => (x === 'menu' || x === 'button' ? x : fallback);

/** Info buttons from the first version (beside the options or the controls) become an info block in the message. */
function infoAsBlock(x: unknown, m: MessageDesign): MessageDesign {
    const items = arr(x).map(obj).filter((o) => typeof o.panelId === 'string' && o.panelId);
    if (!items.length || m.blocks.some((b) => b.type === 'info')) return m;
    const block: InfoBlock = {
        ...newInfoBlock(String(items[0]!.panelId)),
        display: items.every((o) => o.placement === 'menu') ? 'menu' : 'buttons',
        items: items.map((o) => ({ ...newInfoItem(String(o.panelId)), ...(o as Partial<TicketInfoItem>), panelId: String(o.panelId) })),
    };
    return { ...m, blocks: [...m.blocks, block] };
}

function normalizeControls(x: unknown, askReason: boolean): TicketControls {
    const c = obj(x);
    const d = defaultTicketControls();
    const items = obj(c.items);
    // Before placements: the whole open (or closed) set was buttons or a menu. Reopen and Delete only show when closed.
    const openWas: ItemPlacement = c.display === 'menu' ? 'menu' : 'button';
    const closedWas: ItemPlacement = c.closedDisplay === 'menu' ? 'menu' : 'button';
    const merged = Object.fromEntries(TICKET_ACTIONS.map((a) => {
        const it = obj(items[a]);
        const was = a === 'reopen' || a === 'delete' ? closedWas : openWas;
        const placement = placementOf(it.placement, was);
        // The closed message's own placement: the old closed display, else what Reopen and Delete already had.
        const closedPlacement = placementOf(it.closedPlacement, c.closedDisplay !== undefined ? closedWas : a === 'reopen' || a === 'delete' ? placement : 'button');
        return [a, cleanLabel({ ...d.items[a], ...it, roleIds: arr<string>(it.roleIds), placement, closedPlacement })];
    })) as Record<TicketAction, TicketControlItem>;
    if (askReason && !obj(items.close).hasOwnProperty('reason')) merged.close.reason = true;
    merged.close.shown = true;
    return {
        placeholder: typeof c.placeholder === 'string' ? c.placeholder : d.placeholder,
        closedPlaceholder: typeof c.closedPlaceholder === 'string' ? c.closedPlaceholder : d.closedPlaceholder,
        items: merged,
    };
}

/** Only the keys `shape` has (older documents may carry settings that no longer exist). */
const pickKnown = <T extends object>(o: Loose, shape: T): Partial<T> => Object.fromEntries(Object.keys(shape).filter((k) => k in o).map((k) => [k, o[k]])) as Partial<T>;

function normalizeOverride(x: unknown): TicketLifecycleOverride {
    const o = obj(x);
    return {
        transcriptOnDelete: typeof o.transcriptOnDelete === 'boolean' ? o.transcriptOnDelete : null,
        autoDeleteSeconds: typeof o.autoDeleteSeconds === 'number' ? o.autoDeleteSeconds : null,
        closeConfirm: typeof o.closeConfirm === 'string' ? o.closeConfirm : null,
    };
}

function normalizeQuestion(x: unknown): TicketQuestion {
    const q = obj(x);
    const kind = (QUESTION_KINDS.some(([k]) => k === q.kind) ? q.kind : q.style === 'short' ? 'short' : 'paragraph') as QuestionKind;
    const d = newQuestion(kind);
    return {
        ...d,
        id: typeof q.id === 'string' ? q.id : d.id,
        label: typeof q.label === 'string' ? q.label : d.label,
        description: typeof q.description === 'string' ? q.description : '',
        placeholder: typeof q.placeholder === 'string' ? q.placeholder : '',
        required: typeof q.required === 'boolean' ? q.required : d.required,
        min: typeof q.min === 'number' ? q.min : d.min,
        max: typeof q.max === 'number' ? q.max : d.max,
        choices: Array.isArray(q.choices) ? (q.choices as TicketChoice[]) : d.choices,
    };
}

const EMOJI_TAG = /<a?:\w{2,32}:\d{15,22}>/g;

/**
 * A server emoji typed into a name (`Claim <a:ok:123>`) moves to the item's emoji: Discord can't draw it inside a
 * button's text, and a channel named after it would carry the whole tag. The first one becomes the emoji when the
 * item has none; the name keeps only its words.
 */
export function splitLabelEmoji(label: string, emoji: string): { label: string; emoji: string } {
    const tags = label.match(EMOJI_TAG);
    if (!tags) return { label, emoji };
    return { label: label.replace(EMOJI_TAG, ' ').replace(/\s{2,}/g, ' ').trim(), emoji: emoji.trim() ? emoji : tags[0]! };
}

/** A name with any server emoji tags taken out (channel names, headings). */
export const withoutEmojiTags = (text: string) => text.replace(EMOJI_TAG, ' ').replace(/\s{2,}/g, ' ').trim();

const cleanLabel = <T extends { label: string; emoji: string }>(x: T): T => ({ ...x, ...splitLabelEmoji(String(x.label ?? ''), String(x.emoji ?? '')) });

function normalizeOption(x: unknown, askReason: boolean, was: ItemPlacement): TicketOption {
    const o = obj(x);
    const d = newTicketOption(String(o.label ?? 'Support'));
    return {
        ...cleanLabel({ ...d, ...(o as Partial<TicketOption>) }),
        placement: placementOf(o.placement, was),
        ...Object.fromEntries(PLACE_KEYS.map((k) => [k, (o[k] as string | null | undefined) ?? null])),
        supportRoleIds: arr(o.supportRoleIds),
        managerRoleIds: arr(o.managerRoleIds),
        questions: arr(o.questions).map(normalizeQuestion),
        welcome: infoAsBlock(obj(o.controls).info, (o.welcome as MessageDesign | undefined) ?? d.welcome),
        closed: (o.closed as MessageDesign | undefined) ?? d.closed,
        permissions: normalizePermissions(o.permissions),
        controls: normalizeControls(o.controls, askReason),
        lifecycle: normalizeOverride(o.lifecycle),
    };
}

function normalizePanel(x: unknown, askReason: boolean): TicketPanel {
    const { display: _old, info: _info, ...p } = obj(x);
    // A panel is all buttons or all menu. Saved before that came back: all-menu options mean a menu panel.
    const rawOptions = arr<Loose>(p.options);
    const display: TicketPanel['display'] = _old === 'menu' || _old === 'buttons' ? _old : rawOptions.length > 0 && rawOptions.every((o) => obj(o).placement === 'menu') ? 'menu' : 'buttons';
    const was: ItemPlacement = display === 'menu' ? 'menu' : 'button';
    return {
        ...(p as unknown as TicketPanel),
        channelId: (p.channelId as string | null | undefined) ?? null,
        ...Object.fromEntries(PLACE_KEYS.map((k) => [k, (p[k] as string | null | undefined) ?? null])),
        placeholder: typeof p.placeholder === 'string' ? p.placeholder : 'What is your ticket about?',
        blacklistRoleIds: arr(p.blacklistRoleIds),
        display,
        options: rawOptions.map((o) => ({ ...normalizeOption(o, askReason, was), placement: was })),
        infoButtons: arr<Loose>(p.infoButtons).map((i) => cleanLabel({ ...newInfoItem(String(obj(i).panelId ?? '')), ...(obj(i) as Partial<TicketInfoItem>) })).filter((i) => i.panelId),
        message: infoAsBlock(_info, (p.message as MessageDesign | undefined) ?? newTicketPanel().message),
        posted: (p.posted as TicketPanel['posted'] | undefined) ?? null,
    };
}

/** Any stored settings document (or none) as a full, current one: missing parts get their defaults. */
export function normalizeTicketSettings(raw: unknown): TicketSettings {
    const r = obj(raw);
    const d = defaultTicketSettings();
    const g = obj(r.general);
    const askReason = g.closeReason === true;
    const { closeReason: _old, ...general } = g;
    const come = obj(r.come);
    const commands = obj(r.commands);
    return {
        general: { ...d.general, ...(general as Partial<TicketGeneral>), blacklistRoleIds: arr(g.blacklistRoleIds), staffPoints: { ...d.general.staffPoints, ...obj(g.staffPoints) } as TicketGeneral['staffPoints'], lifecycle: { ...d.general.lifecycle, ...pickKnown(obj(g.lifecycle), d.general.lifecycle) }, transcriptPost: normalizeTranscriptMessage(g.transcriptPost, d.general.transcriptPost), dmTranscript: normalizeTranscriptMessage(g.dmTranscript, d.general.dmTranscript) },
        sleep: { ...d.sleep, ...(obj(r.sleep) as Partial<TicketSleep>), roleIds: arr(obj(r.sleep).roleIds), who: Array.isArray(obj(r.sleep).who) ? (obj(r.sleep).who as TicketTarget[]) : d.sleep.who },
        panels: arr(r.panels).map((p) => normalizePanel(p, askReason)),
        come: { ...d.come, ...(come as Partial<TicketCome>), roleIds: arr(come.roleIds), button: { ...d.come.button, ...obj(come.button) } },
        commands: Object.fromEntries(TICKET_COMMANDS.map((c) => {
            const s = obj(commands[c]);
            const saved = arr<string>(s.aliases);
            // Before the full list: the names always worked and `aliases` held only extras.
            const aliases = s.words === true ? saved : [...new Set([...defaultCommandWords(c), ...saved])];
            return [c, { enabled: s.enabled !== false, aliases, words: true }];
        })) as TicketSettings['commands'],
        infoPanels: arr<Panel>(r.infoPanels),
        profile: { ...d.profile, ...(obj(r.profile) as Partial<BotProfile>) },
    };
}

/* ------------------------------------------------------------------ cascading places */

/** Where a ticket of this option goes: its own choice, else the panel's, else the server's. Blacklists add up. */
export function resolvePlaces(g: TicketGeneral, p: TicketPanel, o: TicketOption): TicketPlaces & { blacklistRoleIds: Snowflake[] } {
    const pick = (k: PlaceKey) => o[k] ?? p[k] ?? g[k] ?? null;
    // The log and transcript channels are set on the panel (and in Settings), not per ticket option.
    const panelOrServer = (k: PlaceKey) => p[k] ?? g[k] ?? null;
    return {
        categoryId: pick('categoryId'),
        closedCategoryId: pick('closedCategoryId'),
        logChannelId: panelOrServer('logChannelId'),
        transcriptChannelId: panelOrServer('transcriptChannelId'),
        blacklistRoleIds: [...new Set([...g.blacklistRoleIds, ...p.blacklistRoleIds])],
    };
}

/** Where a place's value comes from, for the dashboard's "from the panel / from Settings" hints. */
export function placeSource(g: TicketGeneral, p: TicketPanel | null, o: TicketOption | null, k: PlaceKey): { id: Snowflake | null; from: 'option' | 'panel' | 'server' | null } {
    if (o?.[k] && k !== 'logChannelId' && k !== 'transcriptChannelId') return { id: o[k], from: 'option' };
    if (p?.[k]) return { id: p[k], from: 'panel' };
    if (g[k]) return { id: g[k], from: 'server' };
    return { id: null, from: null };
}

/* ------------------------------------------------------------------ variables */

export type VariableContext = 'panel' | 'ticket' | 'closed' | 'notice' | 'come' | 'sleep' | 'dm';

/** The words a message can use; the bot fills them in. */
export function ticketVariables(ctx: VariableContext): readonly (readonly [string, string])[] {
    const server: [string, string] = ['{server}', 'The server’s name'];
    if (ctx === 'panel') return [server];
    const ticket: [string, string][] = [
        ['{user}', 'Mentions the ticket owner'],
        ['{username}', 'The owner’s name'],
        ['{support}', 'Mentions the support roles'],
        ['{option}', 'The option’s name'],
        ['{number}', 'The ticket number'],
        ['{channel}', 'Links the ticket channel'],
        server,
    ];
    if (ctx === 'closed') return [...ticket, ['{closer}', 'Mentions who closed it'], ['{reason}', 'The reason given (or “No reason”)']];
    if (ctx === 'notice') return [...ticket, ['{staff}', 'Mentions who pressed it'], ['{member}', 'The member added, removed or given the ticket'], ['{name}', 'The new channel name']];
    if (ctx === 'come') return [...ticket, ['{staff}', 'Mentions who called them']];
    if (ctx === 'sleep') return [...ticket, ['{staff}', 'Mentions who answered last (or used /sleep)'], ['{time}', 'How long until it closes']];
    if (ctx === 'dm') return [['{number}', 'The ticket number'], ['{channel}', 'The ticket channel’s name'], ['{server}', 'The server’s name'], ['{link}', 'The transcript link']];
    return ticket;
}

/** Kept for older imports: the ticket message's words. */
export const TICKET_VARIABLES = ticketVariables('ticket');

/* ------------------------------------------------------------------ permissions maths (the bot uses the same rules) */

export const permState = (o: PermOverwrite | undefined, key: string): PermState => o?.[key] ?? 'inherit';

export function setPerm(o: PermOverwrite, key: string, state: PermState): PermOverwrite {
    const next = { ...o };
    if (state === 'inherit') delete next[key];
    else next[key] = state;
    return next;
}

/** An overwrite as Discord's allow/deny bitfields (decimal strings, as the API wants them). */
export function overwriteBits(o: PermOverwrite): { allow: string; deny: string } {
    let allow = 0n;
    let deny = 0n;
    for (const p of CHANNEL_PERMISSIONS) {
        if (o[p.key] === 'allow') allow |= p.bit;
        else if (o[p.key] === 'deny') deny |= p.bit;
    }
    return { allow: allow.toString(), deny: deny.toString() };
}

/* ------------------------------------------------------------------ templates */

/** A template's panel as a new panel on `guildId`: fresh ids, never posted; another server's channels and roles dropped. */
export function panelFromTemplate(t: Pick<TicketTemplate, 'panel' | 'guildId' | 'name'>, guildId: string): TicketPanel {
    const same = t.guildId === guildId;
    const p = cloneJson(t.panel);
    const clearPlaces = <T extends TicketPlaces>(x: T): T => (same ? x : { ...x, ...noPlaces() });
    return {
        ...clearPlaces(p),
        id: panelId('p'),
        name: t.name,
        channelId: same ? p.channelId : null,
        blacklistRoleIds: same ? p.blacklistRoleIds : [],
        posted: null,
        infoButtons: same ? p.infoButtons : [],
        options: p.options.map((o) => ({
            ...clearPlaces(o),
            id: panelId('o'),
            supportRoleIds: same ? o.supportRoleIds : [],
            managerRoleIds: same ? o.managerRoleIds : [],
            permissions: same ? o.permissions : { ...o.permissions, open: { ...o.permissions.open, roles: {} }, closed: { ...o.permissions.closed, roles: {} }, claimed: { ...o.permissions.claimed, roles: {} } },
            controls: same ? o.controls : { ...o.controls, items: Object.fromEntries(TICKET_ACTIONS.map((a) => [a, { ...o.controls.items[a], roleIds: [] }])) as unknown as TicketControls['items'] },
        })),
    };
}

/* ------------------------------------------------------------------ checks */

const blank = (s: string) => !s.trim();

function messageErrors(m: MessageDesign, where: string): string[] {
    const out: string[] = [];
    if (m.format === 'embed') {
        const e = m.embed;
        if (blank(e.title) && blank(e.description) && blank(e.image) && !e.fields.length) out.push(`${where}: the embed is empty. Give it a title or a description.`);
        if (e.description.length > PANEL_LIMITS.embedDescription) out.push(`${where}: the description is over ${PANEL_LIMITS.embedDescription} characters.`);
        if (m.content.length > TICKET_LIMITS.content) out.push(`${where}: the text above the embed is over ${TICKET_LIMITS.content} characters.`);
    } else {
        const slots = m.blocks.filter((b) => b.type === 'slot').length;
        if (slots !== 1) out.push(`${where}: the buttons block must be there exactly once.`);
        if (m.blocks.filter((b) => b.type === 'slotMenu').length > 1) out.push(`${where}: the menu block can be there only once.`);
        const text = m.blocks.reduce((n, b) => n + (b.type === 'text' || b.type === 'thumbText' ? b.content.length : 0), 0);
        if (text > PANEL_LIMITS.text) out.push(`${where}: the text is over ${PANEL_LIMITS.text} characters.`);
        if (!m.blocks.some((b) => (b.type === 'text' || b.type === 'thumbText') && !blank(b.content)) && !m.blocks.some((b) => b.type === 'image' && b.url)) out.push(`${where}: write something in it.`);
        for (const b of m.blocks) if (b.type === 'info') out.push(...infoBlockErrors(b, where));
    }
    return out;
}

function questionErrors(q: TicketQuestion, name: string): string[] {
    const out: string[] = [];
    const title = `${name}, “${q.label || 'question'}”`;
    if (blank(q.label) || q.label.length > TICKET_LIMITS.question) out.push(`${name}: each question needs a title up to ${TICKET_LIMITS.question} characters.`);
    if (q.description.length > TICKET_LIMITS.description) out.push(`${title}: the description is over ${TICKET_LIMITS.description} characters.`);
    if (CHOICE_KINDS.includes(q.kind)) {
        const cap = q.kind === 'select' ? TICKET_LIMITS.choices : TICKET_LIMITS.groupChoices;
        const least = q.kind === 'radio' ? 2 : 1;
        if (q.choices.length < least || q.choices.length > cap) out.push(`${title}: give it ${least} to ${cap} choices.`);
        if (q.choices.some((c) => blank(c.label) || c.label.length > TICKET_LIMITS.optionLabel)) out.push(`${title}: every choice needs a name.`);
    }
    if (q.min < 0 || q.max < 1 || q.min > q.max) out.push(`${title}: the smallest and largest answers don’t fit together.`);
    return out;
}

/** One message's buttons and menu: at most 25 buttons (20 when there's also a menu: 5 rows in all) and 25 menu entries. */
/** One message's buttons and menu: at most 25 buttons (20 when there's also a menu: 5 rows in all) and 25 menu entries. */
function slotErrors(placements: readonly ItemPlacement[], where: string): string[] {
    const menu = placements.filter((p) => p === 'menu').length;
    const buttons = placements.length - menu;
    const maxButtons = menu ? 20 : 25;
    const out: string[] = [];
    if (buttons > maxButtons) out.push(`${where}: at most ${maxButtons} buttons${menu ? ' with a menu' : ''} (Discord allows 5 rows).`);
    if (menu > TICKET_LIMITS.menuOptions) out.push(`${where}: at most ${TICKET_LIMITS.menuOptions} entries in the menu.`);
    return out;
}

function infoBlockErrors(b: InfoBlock, where: string): string[] {
    const out: string[] = [];
    const menu = b.display === 'menu';
    if (!b.items.length) out.push(`${where}: an info block needs at least one button.`);
    if (b.items.length > (menu ? TICKET_LIMITS.menuOptions : 5)) out.push(`${where}: an info block holds up to ${menu ? TICKET_LIMITS.menuOptions : 5} ${menu ? 'menu entries' : 'buttons'}.`);
    if (b.placeholder.length > TICKET_LIMITS.placeholder) out.push(`${where}: the info menu’s placeholder is too long.`);
    for (const i of b.items) {
        const name = `${where}, info button “${i.label || i.emoji || '…'}”`;
        if (blank(i.label) && (menu || blank(i.emoji))) out.push(`${name}: give it a ${menu ? 'title' : 'label or emoji'}.`);
        if (i.label.length > (menu ? TICKET_LIMITS.optionLabel : TICKET_LIMITS.label)) out.push(`${name}: the label is too long.`);
        if (i.description.length > TICKET_LIMITS.description) out.push(`${name}: the description is over ${TICKET_LIMITS.description} characters.`);
        if (!i.panelId) out.push(`${name}: choose the info panel it shows.`);
    }
    return out;
}

function lifecycleErrors(l: Partial<TicketLifecycle> | TicketLifecycleOverride, where: string): string[] {
    const out: string[] = [];
    const s = l.autoDeleteSeconds;
    if (s !== null && s !== undefined && (!Number.isInteger(s) || s < 0 || s > TICKET_LIMITS.autoDelete)) out.push(`${where}: auto-delete is 0 to ${TICKET_LIMITS.autoDelete.toLocaleString('en')} seconds (7 days).`);
    if (typeof l.closeConfirm === 'string' && l.closeConfirm.length > TICKET_LIMITS.confirmText) out.push(`${where}: the close confirmation is over ${TICKET_LIMITS.confirmText} characters.`);
    return out;
}

export function validateTicketOption(o: TicketOption): string[] {
    const name = `“${o.label || 'Option'}”`;
    const out: string[] = [];
    const menu = o.placement === 'menu';
    if (blank(o.label) && (menu || blank(o.emoji))) out.push(`An option needs a ${menu ? 'title' : 'label or emoji'}.`);
    if (o.label.length > (menu ? TICKET_LIMITS.optionLabel : TICKET_LIMITS.label)) out.push(`${name}: the label is too long.`);
    if (o.description.length > TICKET_LIMITS.description) out.push(`${name}: the description is over ${TICKET_LIMITS.description} characters.`);
    if (blank(o.channelName) || o.channelName.length > TICKET_LIMITS.channelName) out.push(`${name}: give its tickets a channel name (up to ${TICKET_LIMITS.channelName} characters).`);
    if (!Number.isInteger(o.perMember) || o.perMember < 0 || o.perMember > TICKET_LIMITS.perMember) out.push(`${name}: open tickets per member must be 0 to ${TICKET_LIMITS.perMember}.`);
    if (o.questions.length > TICKET_LIMITS.questions) out.push(`${name}: at most ${TICKET_LIMITS.questions} questions (Discord’s popup limit).`);
    for (const q of o.questions) out.push(...questionErrors(q, name));
    if (!o.controls.items.close.shown) out.push(`${name}: the Close control can’t be hidden.`);
    if (!o.controls.items.close.who.length && !o.controls.items.close.roleIds.length) out.push(`${name}: someone must be able to close its tickets.`);
    for (const a of TICKET_ACTIONS) {
        const it = o.controls.items[a];
        if (it.notice.length > TICKET_LIMITS.notice) out.push(`${name}: the ${TICKET_ACTION_INFO[a].name} message is over ${TICKET_LIMITS.notice} characters.`);
        if (it.delay < 0 || it.delay > TICKET_LIMITS.deleteDelay) out.push(`${name}: Delete waits 0 to ${TICKET_LIMITS.deleteDelay} seconds.`);
    }
    out.push(...slotErrors(OPEN_ACTIONS.filter((a) => o.controls.items[a].shown).map((a) => o.controls.items[a].placement), `${name} controls`));
    out.push(...lifecycleErrors(o.lifecycle, name));
    out.push(...messageErrors(o.welcome, `${name} ticket message`));
    out.push(...messageErrors(o.closed, `${name} closed message`));
    return out;
}

export function validateTicketPanel(p: TicketPanel): string[] {
    const out: string[] = [];
    if (blank(p.name)) out.push('Give the panel a name.');
    if (!p.options.length) out.push(`“${p.name}”: add at least one ticket option.`);
    if (p.display === 'menu' && p.options.length > TICKET_LIMITS.menuOptions) out.push(`“${p.name}”: a menu holds up to ${TICKET_LIMITS.menuOptions} options.`);
    if (p.display === 'buttons' && p.options.length + p.infoButtons.length > TICKET_LIMITS.buttonOptions) out.push(`“${p.name}”: up to ${TICKET_LIMITS.buttonOptions} buttons (ticket options and info buttons together).`);
    for (const i of p.infoButtons) if (blank(i.label) && blank(i.emoji)) out.push(`“${p.name}”: an info button needs a label or an emoji.`);
    if (p.placeholder.length > TICKET_LIMITS.placeholder) out.push(`“${p.name}”: the menu placeholder is too long.`);
    out.push(...messageErrors(p.message, `“${p.name}”`));
    for (const o of p.options) out.push(...validateTicketOption(o));
    return out;
}

const ALIAS = /^[^\s]{1,20}$/u;

export function validateTicketSection(section: TicketSectionKey, value: unknown): string[] {
    if (section === 'general') {
        const g = value as TicketGeneral;
        const out: string[] = [];
        if (g.language !== 'en' && g.language !== 'ar') out.push('Pick English or Arabic.');
        if (blank(g.prefix) || g.prefix.length > TICKET_LIMITS.prefix || /\s/.test(g.prefix)) out.push(`The prefix is 1 to ${TICKET_LIMITS.prefix} characters, no spaces.`);
        if (!Number.isInteger(g.nextNumber) || g.nextNumber < 1) out.push('Ticket numbers start at 1 or more.');
        const sp = g.staffPoints;
        if (!sp || typeof sp.enabled !== 'boolean' || !Number.isInteger(sp.perClaim) || sp.perClaim < 1 || sp.perClaim > 100) out.push('Staff points for a claim are 1 to 100.');
        out.push(...lifecycleErrors(g.lifecycle ?? {}, 'Closing defaults'));
        for (const [m, where] of [[g.transcriptPost, 'The transcript channel message'], [g.dmTranscript, 'The transcript direct message']] as const) {
            if (!m) continue;
            if (m.style === 'design') out.push(...messageErrors(m.design, where));
            else if (blank(m.text) || m.text.length > TICKET_LIMITS.content) out.push(`${where}: write its text (up to ${TICKET_LIMITS.content} characters).`);
            if (m.button.show && blank(m.button.label) && blank(m.button.emoji)) out.push(`${where}: the button needs a label or an emoji.`);
        }
        return out;
    }
    if (section === 'profile') return validateProfile(value as BotProfile);
    if (section === 'sleep') {
        const z = value as TicketSleep;
        const out: string[] = [];
        const ok = (n: number) => Number.isInteger(n) && n >= 1 && n <= TICKET_LIMITS.sleepMinutes;
        if (!ok(z.reminderMinutes) || !ok(z.closeMinutes)) out.push(`Sleep times are 1 to ${TICKET_LIMITS.sleepMinutes.toLocaleString('en')} minutes.`);
        else if (z.reminderMinutes >= z.closeMinutes) out.push('The reminder must come before the ticket closes.');
        out.push(...messageErrors(z.ticketMessage, 'The message in the ticket'));
        out.push(...messageErrors(z.dmMessage, 'The direct message'));
        return out;
    }
    if (section === 'come') {
        const c = value as TicketCome;
        const out: string[] = [];
        if (!Number.isInteger(c.cooldown) || c.cooldown < 0 || c.cooldown > TICKET_LIMITS.cooldown) out.push(`The wait between two calls is 0 to ${TICKET_LIMITS.cooldown} minutes.`);
        if (blank(c.button.label) && blank(c.button.emoji)) out.push('The link button needs a label or an emoji.');
        if (c.button.label.length > TICKET_LIMITS.label) out.push('The link button’s label is too long.');
        if (c.notice.length > TICKET_LIMITS.notice) out.push(`The message in the ticket is over ${TICKET_LIMITS.notice} characters.`);
        out.push(...messageErrors(c.message, 'The direct message'));
        return out;
    }
    if (section === 'commands') {
        const cmds = value as TicketSettings['commands'];
        const out: string[] = [];
        const seen = new Map<string, string>();
        for (const c of TICKET_COMMANDS) {
            const s = cmds?.[c];
            if (!s) { out.push(`The ${c} command is missing.`); continue; }
            if (s.aliases.length > TICKET_LIMITS.aliases) out.push(`${c}: at most ${TICKET_LIMITS.aliases} typed words.`);
            for (const word of s.words === true ? s.aliases : [...defaultCommandWords(c), ...s.aliases]) {
                const w = word.toLowerCase();
                if (!ALIAS.test(word)) out.push(`${c}: “${word}” must be one word up to ${TICKET_LIMITS.alias} characters.`);
                else if (seen.has(w) && seen.get(w) !== c) out.push(`“${word}” is used by both ${seen.get(w)} and ${c}.`);
                seen.set(w, c);
            }
        }
        return out;
    }
    if (section === 'infoPanels') {
        const list = value as Panel[];
        if (!Array.isArray(list)) return ['Send the info panels as a list.'];
        if (list.length > PANEL_LIMITS.panels) return [`At most ${PANEL_LIMITS.panels} info panels.`];
        return list.flatMap((p) => validatePanel(p).map((e) => `“${p.name || 'Info panel'}”: ${e}`));
    }
    const panels = value as TicketPanel[];
    if (!Array.isArray(panels)) return ['Send the panels as a list.'];
    if (panels.length > TICKET_LIMITS.panels) return [`At most ${TICKET_LIMITS.panels} panels.`];
    return panels.flatMap(validateTicketPanel);
}

/** The bot's invite: it makes channels in categories, sets their permissions and reads the messages for transcripts. */
export const TICKET_PERMISSIONS = String(
    (1n << 4n) | (1n << 10n) | (1n << 11n) | (1n << 13n) | (1n << 14n) | (1n << 15n) | (1n << 16n) | (1n << 18n) | (1n << 6n) | (1n << 28n) | (1n << 7n) | (1n << 31n),
);
