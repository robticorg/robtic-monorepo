import { TRANSCRIPT_FORMAT, type TicketTranscriptDocument, type TranscriptMessageView } from '@robo/shared';

// A sample transcript with everything a real one can hold: the bot's welcome embed and its ticket controls, form
// answers, an edit with its history, a deleted message (and who deleted it), an image, a voice message, a sticker, a
// custom emoji, reactions, a reply, Arabic text, a rename and the close notice. Used to try the page locally.

const AVATAR = (n: number) => `https://cdn.discordapp.com/embed/avatars/${n}.png`;
const at = (min: number) => new Date(Date.UTC(2026, 10, 14, 17, 30 + min)).toISOString();

// Public sample files (the page only loads https media, never data: or http: URLs).
const screenshot = 'https://picsum.photos/seed/robtic-ticket/640/360';
const voice = 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Example.ogg';

const base = (id: string, authorId: string, min: number, over: Partial<TranscriptMessageView> = {}): TranscriptMessageView => ({
    messageId: id,
    authorId,
    content: null,
    createdAt: at(min),
    editedAt: null,
    deleted: false,
    deletedAt: null,
    revision: 0,
    referenceMessageId: null,
    isBot: authorId === '1430295830291812536',
    isSystem: false,
    mentions: { users: [], roles: [], channels: [], everyone: false },
    embeds: [],
    components: [],
    stickers: [],
    reactions: [],
    deletedBy: null,
    attachments: [],
    incompleteFields: [],
    editHistory: [],
    ...over,
});

const BOT = '1430295830291812536';
const LAYLA = '700000000000000101';
const SARA = '700000000000000102';
const OMAR = '700000000000000103';
const SCAMMER = '700000000000000199';

const controls = (labels: [string, string, number][]) => [{
    type: 'actionRow' as const,
    children: labels.map(([emoji, label, style]) => ({ type: 'button' as const, label, emoji, style, url: null, disabled: false })),
}];

export function showcaseTranscript(id: string): TicketTranscriptDocument {
    const n = /^tr_mock(\d+)$/.exec(id)?.[1];
    const number = n ? Number(n) : 128;
    const messages: TranscriptMessageView[] = [
        base('m1', BOT, 0, {
            content: `<@${LAYLA}> <@&900000000000000001>`,
            mentions: { users: [LAYLA], roles: ['900000000000000001'], channels: [], everyone: false },
            embeds: [{ type: 'rich', title: 'Report a member', url: null, hasImage: false, hasThumbnail: false, fieldCount: 0, color: 0x1793ff, description: `Thanks for reaching out, <@${LAYLA}>. Tell us what you need and a member of the team will answer soon.\n\nUse the buttons below to manage this ticket.`, footer: { text: 'Robtic Community · Support', iconUrl: null } }],
            components: controls([['🔒', 'Close', 4], ['🙋', 'Claim', 3], ['✏️', 'Rename', 2], ['➕', 'Add', 2], ['📄', 'Transcript', 2]]),
        }),
        base('m2', BOT, 0, {
            embeds: [{ type: 'rich', title: '📝 Answers from layla', url: null, hasImage: false, hasThumbnail: false, fieldCount: 2, color: 0x1793ff, fields: [{ name: 'Who are you reporting?', value: 'night_trader (199…)', inline: false }, { name: 'What happened?', value: 'He keeps sending “free nitro” links in DMs to new members.', inline: false }] }],
        }),
        base('m3', LAYLA, 1, { content: 'Hi! Someone keeps sending scam links to new members 😕' }),
        base('m4', LAYLA, 2, {
            content: 'Here is what he sent me:',
            attachments: [{ id: 'a1', url: screenshot, proxyUrl: null, filename: 'screenshot.jpg', contentType: 'image/jpeg', size: 48_213, width: 640, height: 360, durationSeconds: null, spoiler: false, description: 'The scam message', isImage: true }],
        }),
        base('m5', BOT, 4, { content: `🙋 <@${SARA}> has claimed this ticket.`, mentions: { users: [SARA], roles: [], channels: [], everyone: false } }),
        base('m6', SARA, 5, {
            content: 'Thanks Layla, I’m on it. Can you send me his user ID, or mention him here?',
            editedAt: at(6),
            revision: 1,
            editHistory: [{ at: at(6), before: 'Thanks, send the ID', after: 'Thanks Layla, I’m on it. Can you send me his user ID, or mention him here?' }],
        }),
        base('m7', LAYLA, 7, {
            content: `<@${SCAMMER}> is the one. He joined yesterday.`,
            mentions: { users: [SCAMMER], roles: [], channels: [], everyone: false },
            reactions: [{ emoji: { id: null, name: '👍', animated: false }, userIds: [SARA, OMAR] }, { emoji: { id: null, name: '🔥', animated: false }, userIds: [OMAR] }],
        }),
        base('m8', LAYLA, 8, { content: 'oops, wrong screenshot', deleted: true, deletedAt: at(8), deletedBy: { userId: LAYLA, kind: 'self' } }),
        base('m9', LAYLA, 9, {
            attachments: [{ id: 'a2', url: voice, proxyUrl: null, filename: 'voice-message.ogg', contentType: 'audio/ogg', size: 22_011, width: null, height: null, durationSeconds: 7.4, spoiler: false, description: null, isImage: false, isVoiceMessage: true, waveform: 'AAgPHioxNjtAQkNEQ0E/PDo3NDEuKygmJCIgHh0bGRgXFhUUExIREA8ODQwLCgkIBwYFBAMCAQA=' }],
        }),
        base('m10', BOT, 11, { content: `➕ <@${OMAR}> was added to the ticket.`, mentions: { users: [OMAR], roles: [], channels: [], everyone: false } }),
        base('m11', OMAR, 12, {
            content: 'تم حظر العضو من السيرفر، شكراً جزيلاً على الإبلاغ 🙏',
            stickers: [{ id: '749054660769218631', name: 'Wave', formatType: 1 }],
        }),
        base('m12', LAYLA, 13, {
            content: 'Thank you both! <:robtic:1304512345678901234> **amazing** team',
            referenceMessageId: 'm11',
            reactions: [{ emoji: { id: '1304512345678901234', name: 'robtic', animated: false }, userIds: [SARA] }],
        }),
        base('m13', SARA, 14, { content: 'Anytime. Closing this now, take care!' }),
        base('m14', BOT, 15, {
            embeds: [{ type: 'rich', title: '🔒 Ticket closed', url: null, hasImage: false, hasThumbnail: false, fieldCount: 0, color: 0xda373c, description: `Closed by <@${SARA}>. Reason: Member banned.\nThe transcript is saved.` }],
            components: controls([['🔓', 'Reopen', 3], ['📄', 'Transcript', 2], ['🗑️', 'Delete', 4]]),
        }),
    ];
    const human = messages.filter((m) => !m.isBot && (m.content || m.attachments.length || m.stickers.length));
    return {
        format: TRANSCRIPT_FORMAT,
        transcriptId: id,
        generatedAt: at(16),
        locale: 'en',
        guild: { id: '1100000000000000001', name: 'Robtic Community', iconUrl: null },
        ticket: {
            number,
            channelId: '1100000000000000777',
            channelName: `report-${String(number).padStart(4, '0')}`,
            channelTopic: 'Report a member · opened by layla',
            panelName: 'Support',
            optionLabel: 'Report a member',
            openedAt: at(0),
            closedAt: at(15),
            closedBy: SARA,
            closeReason: 'Member banned',
            ownerId: LAYLA,
            claimerId: SARA,
            participants: [
                { userId: LAYLA, role: 'owner', addedAt: at(0), removedAt: null },
                { userId: SARA, role: 'claimer', addedAt: at(4), removedAt: null },
                { userId: OMAR, role: 'added', addedAt: at(11), removedAt: null },
            ],
            answers: [
                { question: 'Who are you reporting?', answer: 'night_trader (199…)' },
                { question: 'What happened?', answer: 'He keeps sending “free nitro” links in DMs to new members.' },
            ],
        },
        users: {
            [BOT]: { id: BOT, username: 'Robtic Ticket', displayName: 'Robtic Ticket', avatarUrl: AVATAR(0), bot: true },
            [LAYLA]: { id: LAYLA, username: 'layla', displayName: 'Layla', avatarUrl: AVATAR(1), bot: false },
            [SARA]: { id: SARA, username: 'sara.k', displayName: 'Sara', avatarUrl: AVATAR(3), bot: false },
            [OMAR]: { id: OMAR, username: 'omar_dev', displayName: 'عمر', avatarUrl: AVATAR(4), bot: false },
            [SCAMMER]: { id: SCAMMER, username: 'night_trader', displayName: 'night_trader', avatarUrl: AVATAR(5), bot: false },
        },
        messages,
        channelEvents: [{ type: 'renamed', from: `ticket-${String(number).padStart(4, '0')}`, to: `report-${String(number).padStart(4, '0')}`, at: at(6) }],
        stats: {
            messageCount: human.length,
            deletedCount: messages.filter((m) => m.deleted).length,
            editedCount: messages.filter((m) => m.revision > 0).length,
            attachmentCount: messages.reduce((a, m) => a + m.attachments.length, 0),
            imageCount: messages.reduce((a, m) => a + m.attachments.filter((x) => x.isImage).length, 0),
            renameCount: 1,
            participantCount: 3,
        },
    };
}
