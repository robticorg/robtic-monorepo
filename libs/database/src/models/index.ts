import mongoose, { Schema, type InferSchemaType } from 'mongoose';

// Robtic Ticket's collections. The dashboard (robtic-discord libs/server/src/real/ticket.ts) reads and writes
// `ticketsettings` and `panelposts`, and reads `tickets` and `transcripts` for its numbers. Keep the names in step.

const Mixed = Schema.Types.Mixed;

/** One per server: everything the dashboard sets (TicketSettings in @robo/shared). */
const ticketSettingsSchema = new Schema(
    {
        guildId: { type: String, required: true, unique: true },
        general: { type: Mixed, default: null },
        panels: { type: Mixed, default: () => [] },
        come: { type: Mixed, default: null },
        commands: { type: Mixed, default: null },
        updatedBy: { type: String, default: null },
    },
    { timestamps: true, minimize: false },
);

/** "Post this panel" requests from the dashboard; the bot picks them up within seconds. */
const panelPostSchema = new Schema({
    guildId: { type: String, required: true },
    panelId: { type: String, required: true },
    requestedAt: { type: Date, required: true },
    doneAt: { type: Date, default: null },
    error: { type: String, default: null },
});
panelPostSchema.index({ guildId: 1, panelId: 1 }, { unique: true });
panelPostSchema.index({ doneAt: 1 });

/** Ticket numbers, per server. */
const counterSchema = new Schema({ guildId: { type: String, required: true, unique: true }, next: { type: Number, default: 1 } });

const participantSchema = new Schema(
    { userId: String, role: { type: String, enum: ['owner', 'claimer', 'added', 'staff'] }, addedAt: Date, removedAt: { type: Date, default: null } },
    { _id: false },
);

/** One per ticket channel. */
const ticketSchema = new Schema(
    {
        guildId: { type: String, required: true, index: true },
        channelId: { type: String, required: true, unique: true },
        channelName: { type: String, required: true },
        channelTopic: { type: String, default: null },
        number: { type: Number, required: true },
        panelId: { type: String, required: true },
        panelName: { type: String, default: '' },
        optionId: { type: String, required: true },
        optionLabel: { type: String, default: '' },
        ownerId: { type: String, required: true },
        claimerId: { type: String, default: null },
        /** Members let in with Add (not the owner, not staff by role). */
        addedIds: { type: [String], default: [] },
        participants: { type: [participantSchema], default: [] },
        answers: { type: [{ question: String, answer: String, _id: false }], default: [] },
        status: { type: String, enum: ['open', 'closed'], default: 'open', index: true },
        openedAt: { type: Date, default: () => new Date() },
        closedAt: { type: Date, default: null },
        closedBy: { type: String, default: null },
        closeReason: { type: String, default: null },
        /** Renames and topic changes, for the transcript. */
        channelEvents: { type: [{ type: { type: String }, from: String, to: String, at: Date, _id: false }], default: [] },
        transcriptId: { type: String, default: null },
    },
    { timestamps: true },
);
ticketSchema.index({ guildId: 1, ownerId: 1, optionId: 1, status: 1 });

/** The latest state of each message in a ticket channel (the transcript is built from these). */
const transcriptMessageSchema = new Schema(
    {
        guildId: { type: String, required: true },
        channelId: { type: String, required: true, index: true },
        messageId: { type: String, required: true, unique: true },
        author: { type: Mixed, default: null },
        content: { type: String, default: null },
        type: { type: Number, default: null },
        flags: { type: Number, default: null },
        messageCreatedAt: { type: Date, default: null },
        editedAt: { type: Date, default: null },
        referenceMessageId: { type: String, default: null },
        isBot: { type: Boolean, default: false },
        isSystem: { type: Boolean, default: false },
        mentions: { type: Mixed, default: () => ({ users: [], roles: [], channels: [], everyone: false }) },
        embeds: { type: Mixed, default: () => [] },
        components: { type: Mixed, default: () => [] },
        stickers: { type: Mixed, default: () => [] },
        attachments: { type: Mixed, default: () => [] },
        incompleteFields: { type: [String], default: [] },
        reactions: { type: Mixed, default: () => [] },
        deleted: { type: Boolean, default: false },
        deletedAt: { type: Date, default: null },
        deletedBy: { type: Mixed, default: null },
        revision: { type: Number, default: 0 },
    },
    { minimize: false },
);

/** Every edit, so the transcript can show what a message said before. */
const transcriptEditSchema = new Schema({
    channelId: { type: String, required: true, index: true },
    messageId: { type: String, required: true },
    at: { type: Date, default: () => new Date() },
    before: { type: String, default: null },
    after: { type: String, default: null },
});

/** A saved transcript: the document the transcript page renders, plus a few fields the dashboard lists. */
const transcriptSchema = new Schema(
    {
        publicId: { type: String, required: true, unique: true },
        guildId: { type: String, required: true, index: true },
        channelId: { type: String, required: true },
        ticketNumber: Number,
        channelName: String,
        panelName: { type: String, default: '' },
        optionLabel: String,
        ownerId: { type: String, default: null, index: true },
        ownerName: String,
        claimerId: { type: String, default: null, index: true },
        claimerName: { type: String, default: null },
        participantIds: { type: [String], default: [] },
        messageCount: Number,
        openedAt: Date,
        closedAt: { type: Date, index: true },
        document: { type: Mixed, required: true },
    },
    { timestamps: true, minimize: false },
);

const model = <T extends Schema>(name: string, schema: T, collection: string) =>
    (mongoose.models[name] as mongoose.Model<InferSchemaType<T>> | undefined) ?? mongoose.model(name, schema, collection);

export const TicketSettingsModel = model('TicketSettings', ticketSettingsSchema, 'ticketsettings');
export const PanelPostModel = model('PanelPost', panelPostSchema, 'panelposts');
export const CounterModel = model('TicketCounter', counterSchema, 'ticketcounters');
export const TicketModel = model('Ticket', ticketSchema, 'tickets');
export const TranscriptMessageModel = model('TranscriptMessage', transcriptMessageSchema, 'transcriptmessages');
export const TranscriptEditModel = model('TranscriptEdit', transcriptEditSchema, 'transcriptedits');
export const TranscriptModel = model('Transcript', transcriptSchema, 'transcripts');

export type TicketDoc = InferSchemaType<typeof ticketSchema> & { _id: mongoose.Types.ObjectId };
export type TranscriptMessageDoc = InferSchemaType<typeof transcriptMessageSchema>;
