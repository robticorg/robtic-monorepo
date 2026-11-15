// ---- copied from robtic-discord libs/shared/src/ticket.ts (the dashboard's contract). Change both together. ----
// Only this header differs: the few dashboard types the contract leans on are copied in here.

export type Snowflake = string;

/** Discord's limits the panels respect (docs.discord.com: Components, Embeds). */
export const PANEL_LIMITS = { text: 4000, embedTitle: 256, embedDescription: 4096, embedFields: 25, fieldName: 256, fieldValue: 1024, footer: 2048 } as const;

let seq = 0;
export const panelId = (p: string) => `${p}${Date.now().toString(36)}${(seq++).toString(36)}`;

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

/** The bot's look in a server (the dashboard saves it to Discord directly; the bot never reads it). */
export interface BotProfile { nickname: string | null; avatarUrl: string | null; bannerUrl: string | null; bio: string | null }
export const defaultProfile = (): BotProfile => ({ nickname: null, avatarUrl: null, bannerUrl: null, bio: null });
export const validateProfile = (_p: BotProfile): string[] => [];


// Robtic Ticket: ticket panels a server designs on the dashboard and the bot (Discord Bots/Public Ticket) runs. One
// settings document per server holds everything: the panels (each a message with its ticket options as buttons or a
// menu), and for every option what happens when a member opens it: the channel it makes, who sees it and what they may
// do there, the message the bot posts inside it and that message's ticket controls (Close, Claim, Rename…), and the
// message posted when it closes.
//
// Channels and categories cascade: a ticket option's own choice wins, then its panel's, then the server's (Settings).
//
// The bot keeps a copy of these types (Public Ticket libs/shared/src/settings.ts). Change both together.

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
    aliases: 5,
    alias: 20,
    /** Minutes between two calls of !come in one ticket. */
    cooldown: 1440,
    /** Seconds Delete waits before the channel goes. */
    deleteDelay: 60,
    templates: 100,
    templateName: 60,
} as const;

export type TicketLanguage = 'en' | 'ar';
export type TicketButtonStyle = 'primary' | 'secondary' | 'success' | 'danger';
export const TICKET_BUTTON_STYLES: readonly (readonly [TicketButtonStyle, string])[] = [['primary', 'Blurple'], ['secondary', 'Grey'], ['success', 'Green'], ['danger', 'Red']];

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
    | { id: string; type: 'slot' };

export const MESSAGE_BLOCK_KINDS = [
    ['text', 'Text', 'Markdown: headings, lists, links, mentions.'],
    ['thumbText', 'Text with a picture', 'Text with a small picture beside it.'],
    ['image', 'Image', 'A wide picture or GIF.'],
    ['separator', 'Separator', 'A divider line or a gap.'],
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
}

/* ------------------------------------------------------------------ the ticket controls */

/** What can be done to a ticket. The first group sits on the open ticket's message; the second on the closed message. */
export const TICKET_ACTIONS = ['close', 'claim', 'rename', 'add', 'remove', 'transfer', 'transcript', 'reopen', 'delete'] as const;
export type TicketAction = (typeof TICKET_ACTIONS)[number];
export const OPEN_ACTIONS: readonly TicketAction[] = ['close', 'claim', 'rename', 'add', 'remove', 'transfer', 'transcript'];
export const CLOSED_ACTIONS: readonly TicketAction[] = ['reopen', 'transcript', 'delete'];

export const TICKET_ACTION_INFO: Record<TicketAction, { name: string; does: string; command: string; locked?: boolean }> = {
    close: { name: 'Close', does: 'Closes the ticket and saves the transcript.', command: 'close', locked: true },
    claim: { name: 'Claim', does: 'A staff member takes the ticket. Press again to unclaim.', command: 'claim' },
    rename: { name: 'Rename', does: 'Changes the channel name.', command: 'rename' },
    add: { name: 'Add member', does: 'Lets another member into the ticket.', command: 'add' },
    remove: { name: 'Remove member', does: 'Takes a member out of the ticket.', command: 'remove' },
    transfer: { name: 'Transfer', does: 'Gives the ticket to another staff member.', command: 'transfer' },
    transcript: { name: 'Transcript', does: 'Saves the conversation so far and sends the link.', command: 'transcript' },
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
}

export interface TicketControls {
    /** The open ticket's controls: buttons or one menu. */
    display: 'buttons' | 'menu';
    placeholder: string;
    /** The closed message's controls. */
    closedDisplay: 'buttons' | 'menu';
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
}

export interface TicketPanel extends TicketPlaces {
    id: string;
    name: string;
    /** Where the panel is posted. */
    channelId: Snowflake | null;
    message: MessageDesign;
    /** The options as buttons, or as one menu. */
    display: 'buttons' | 'menu';
    placeholder: string;
    /** Members with these roles can't open tickets here (added to the server's list). */
    blacklistRoleIds: Snowflake[];
    options: TicketOption[];
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

export const TICKET_COMMANDS = [...TICKET_ACTIONS, 'come'] as const;
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
};

export interface TicketCommandSetting {
    /** Off: the typed command and the slash command both answer that it's turned off. Buttons still work. */
    enabled: boolean;
    /** Extra words for the typed command (the English and Arabic names always work). */
    aliases: string[];
}

export interface TicketSettings {
    general: TicketGeneral;
    panels: TicketPanel[];
    come: TicketCome;
    commands: Record<TicketCommand, TicketCommandSetting>;
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
}

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
}

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

const item = (label: string, emoji: string, style: TicketButtonStyle, who: TicketTarget[], description = '', more: Partial<TicketControlItem> = {}): TicketControlItem => ({
    shown: true, label, emoji, style, description, who, roleIds: [], confirm: false, reason: false, notice: '', delay: 0, ...more,
});

export const defaultTicketControls = (): TicketControls => ({
    display: 'buttons',
    placeholder: 'Ticket options',
    closedDisplay: 'buttons',
    closedPlaceholder: 'Closed ticket options',
    items: {
        close: item('Close', '🔒', 'danger', ['owner', 'claimer', 'support', 'manager'], 'Close this ticket', { confirm: true }),
        claim: item('Claim', '🙋', 'success', ['support', 'manager'], 'Take this ticket'),
        rename: item('Rename', '✏️', 'secondary', ['claimer', 'manager'], 'Change the channel name'),
        add: item('Add', '➕', 'secondary', ['claimer', 'support', 'manager'], 'Let a member in'),
        remove: item('Remove', '➖', 'secondary', ['claimer', 'manager'], 'Take a member out'),
        transfer: item('Transfer', '🔁', 'secondary', ['claimer', 'manager'], 'Give it to another staff member', { shown: false }),
        transcript: item('Transcript', '📄', 'secondary', ['claimer', 'support', 'manager'], 'Save the conversation'),
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
    Object.fromEntries(TICKET_COMMANDS.map((c) => [c, { enabled: true, aliases: [] }])) as unknown as Record<TicketCommand, TicketCommandSetting>;

export const noPlaces = (): TicketPlaces => ({ categoryId: null, closedCategoryId: null, logChannelId: null, transcriptChannelId: null });

export function newTicketOption(label = 'Support', emoji = '🎫'): TicketOption {
    return {
        id: panelId('o'),
        label,
        emoji,
        description: '',
        style: 'primary',
        enabled: true,
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

export const newMessageBlock = (kind: MessageBlockKind): MessageBlock => {
    switch (kind) {
        case 'text': return { id: panelId('t'), type: 'text', content: '' };
        case 'thumbText': return { id: panelId('h'), type: 'thumbText', content: '', thumbnail: '' };
        case 'image': return { id: panelId('i'), type: 'image', url: '' };
        case 'separator': return { id: panelId('s'), type: 'separator', divider: true, spacing: 1 };
    }
};

export const defaultTicketSettings = (): TicketSettings => ({
    general: { language: 'en', prefix: '!', ...noPlaces(), transcriptToOwner: true, blacklistRoleIds: [], nextNumber: 1 },
    panels: [],
    come: defaultCome(),
    commands: defaultCommands(),
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
    if (p.open || p.closed) return { open: normalizeSet(p.open, d.open), closed: normalizeSet(p.closed, d.closed) };
    if (!p.targets) return d;
    const open = normalizeSet(p, d.open);
    const shut: PermOverwrite = p.closedOwner === 'hidden' ? { ViewChannel: 'deny' } : { ...VIEW_ONLY };
    return { open, closed: { targets: { ...structuredClone(open.targets), owner: shut, added: shut }, roles: structuredClone(open.roles) } };
}

function normalizeControls(x: unknown, askReason: boolean): TicketControls {
    const c = obj(x);
    const d = defaultTicketControls();
    const items = obj(c.items);
    const merged = Object.fromEntries(TICKET_ACTIONS.map((a) => [a, { ...d.items[a], ...obj(items[a]), roleIds: arr<string>(obj(items[a]).roleIds) }])) as Record<TicketAction, TicketControlItem>;
    if (askReason && !obj(items.close).hasOwnProperty('reason')) merged.close.reason = true;
    merged.close.shown = true;
    return {
        display: c.display === 'menu' ? 'menu' : 'buttons',
        placeholder: typeof c.placeholder === 'string' ? c.placeholder : d.placeholder,
        closedDisplay: c.closedDisplay === 'menu' ? 'menu' : 'buttons',
        closedPlaceholder: typeof c.closedPlaceholder === 'string' ? c.closedPlaceholder : d.closedPlaceholder,
        items: merged,
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

function normalizeOption(x: unknown, askReason: boolean): TicketOption {
    const o = obj(x);
    const d = newTicketOption(String(o.label ?? 'Support'));
    return {
        ...d,
        ...(o as Partial<TicketOption>),
        ...Object.fromEntries(PLACE_KEYS.map((k) => [k, (o[k] as string | null | undefined) ?? null])),
        supportRoleIds: arr(o.supportRoleIds),
        managerRoleIds: arr(o.managerRoleIds),
        questions: arr(o.questions).map(normalizeQuestion),
        welcome: (o.welcome as MessageDesign | undefined) ?? d.welcome,
        closed: (o.closed as MessageDesign | undefined) ?? d.closed,
        permissions: normalizePermissions(o.permissions),
        controls: normalizeControls(o.controls, askReason),
    };
}

function normalizePanel(x: unknown, askReason: boolean): TicketPanel {
    const p = obj(x);
    return {
        ...(p as unknown as TicketPanel),
        channelId: (p.channelId as string | null | undefined) ?? null,
        ...Object.fromEntries(PLACE_KEYS.map((k) => [k, (p[k] as string | null | undefined) ?? null])),
        display: p.display === 'menu' ? 'menu' : 'buttons',
        placeholder: typeof p.placeholder === 'string' ? p.placeholder : 'What is your ticket about?',
        blacklistRoleIds: arr(p.blacklistRoleIds),
        options: arr(p.options).map((o) => normalizeOption(o, askReason)),
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
        general: { ...d.general, ...(general as Partial<TicketGeneral>), blacklistRoleIds: arr(g.blacklistRoleIds) },
        panels: arr(r.panels).map((p) => normalizePanel(p, askReason)),
        come: { ...d.come, ...(come as Partial<TicketCome>), roleIds: arr(come.roleIds), button: { ...d.come.button, ...obj(come.button) } },
        commands: Object.fromEntries(TICKET_COMMANDS.map((c) => [c, { enabled: obj(commands[c]).enabled !== false, aliases: arr<string>(obj(commands[c]).aliases) }])) as TicketSettings['commands'],
        profile: { ...d.profile, ...(obj(r.profile) as Partial<BotProfile>) },
    };
}

/* ------------------------------------------------------------------ cascading places */

/** Where a ticket of this option goes: its own choice, else the panel's, else the server's. Blacklists add up. */
export function resolvePlaces(g: TicketGeneral, p: TicketPanel, o: TicketOption): TicketPlaces & { blacklistRoleIds: Snowflake[] } {
    const pick = (k: PlaceKey) => o[k] ?? p[k] ?? g[k] ?? null;
    return {
        categoryId: pick('categoryId'),
        closedCategoryId: pick('closedCategoryId'),
        logChannelId: pick('logChannelId'),
        transcriptChannelId: pick('transcriptChannelId'),
        blacklistRoleIds: [...new Set([...g.blacklistRoleIds, ...p.blacklistRoleIds])],
    };
}

/** Where a place's value comes from, for the dashboard's "from the panel / from Settings" hints. */
export function placeSource(g: TicketGeneral, p: TicketPanel | null, o: TicketOption | null, k: PlaceKey): { id: Snowflake | null; from: 'option' | 'panel' | 'server' | null } {
    if (o?.[k]) return { id: o[k], from: 'option' };
    if (p?.[k]) return { id: p[k], from: 'panel' };
    if (g[k]) return { id: g[k], from: 'server' };
    return { id: null, from: null };
}

/* ------------------------------------------------------------------ variables */

export type VariableContext = 'panel' | 'ticket' | 'closed' | 'notice' | 'come';

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
    const p = structuredClone(t.panel);
    const clearPlaces = <T extends TicketPlaces>(x: T): T => (same ? x : { ...x, ...noPlaces() });
    return {
        ...clearPlaces(p),
        id: panelId('p'),
        name: t.name,
        channelId: same ? p.channelId : null,
        blacklistRoleIds: same ? p.blacklistRoleIds : [],
        posted: null,
        options: p.options.map((o) => ({
            ...clearPlaces(o),
            id: panelId('o'),
            supportRoleIds: same ? o.supportRoleIds : [],
            managerRoleIds: same ? o.managerRoleIds : [],
            permissions: same ? o.permissions : { open: { ...o.permissions.open, roles: {} }, closed: { ...o.permissions.closed, roles: {} } },
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
        const text = m.blocks.reduce((n, b) => n + (b.type === 'text' || b.type === 'thumbText' ? b.content.length : 0), 0);
        if (text > PANEL_LIMITS.text) out.push(`${where}: the text is over ${PANEL_LIMITS.text} characters.`);
        if (!m.blocks.some((b) => (b.type === 'text' || b.type === 'thumbText') && !blank(b.content)) && !m.blocks.some((b) => b.type === 'image' && b.url)) out.push(`${where}: write something in it.`);
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

export function validateTicketOption(o: TicketOption, display: 'buttons' | 'menu'): string[] {
    const name = `“${o.label || 'Option'}”`;
    const out: string[] = [];
    if (blank(o.label) && (display === 'menu' || blank(o.emoji))) out.push(`An option needs a ${display === 'menu' ? 'title' : 'label or emoji'}.`);
    if (o.label.length > (display === 'menu' ? TICKET_LIMITS.optionLabel : TICKET_LIMITS.label)) out.push(`${name}: the label is too long.`);
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
    out.push(...messageErrors(o.welcome, `${name} ticket message`));
    out.push(...messageErrors(o.closed, `${name} closed message`));
    return out;
}

export function validateTicketPanel(p: TicketPanel): string[] {
    const out: string[] = [];
    if (blank(p.name)) out.push('Give the panel a name.');
    if (!p.options.length) out.push(`“${p.name}”: add at least one ticket option.`);
    const max = p.display === 'menu' ? TICKET_LIMITS.menuOptions : TICKET_LIMITS.buttonOptions;
    if (p.options.length > max) out.push(`“${p.name}”: at most ${max} options as ${p.display === 'menu' ? 'a menu' : 'buttons'}.`);
    if (p.placeholder.length > TICKET_LIMITS.placeholder) out.push(`“${p.name}”: the menu placeholder is too long.`);
    out.push(...messageErrors(p.message, `“${p.name}”`));
    for (const o of p.options) out.push(...validateTicketOption(o, p.display));
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
        return out;
    }
    if (section === 'profile') return validateProfile(value as BotProfile);
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
            if (s.aliases.length > TICKET_LIMITS.aliases) out.push(`${c}: at most ${TICKET_LIMITS.aliases} extra words.`);
            for (const word of [c, TICKET_COMMAND_INFO[c].ar, ...s.aliases]) {
                const w = word.toLowerCase();
                if (!ALIAS.test(word)) out.push(`${c}: “${word}” must be one word up to ${TICKET_LIMITS.alias} characters.`);
                else if (seen.has(w) && seen.get(w) !== c) out.push(`“${word}” is used by both ${seen.get(w)} and ${c}.`);
                seen.set(w, c);
            }
        }
        return out;
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
