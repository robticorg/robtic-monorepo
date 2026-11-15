import { afterAll, beforeAll, describe, expect, test } from "bun:test";

import { connectDatabase, mongoose, PanelPostModel, PanelPostRepository, SettingsRepository, TicketRepository, TicketSettingsModel, TranscriptRepository } from "@robo/db";
import { newTicketOption, newTicketPanel } from "@robo/shared";
import { overLimit } from "../src/ticket/utils/ticektAccess";
import { buildDocument } from "../src/ticket/transcript/archive";

// Against a real MongoDB (TEST_MONGODB_URI, default a local server) in a throwaway database that is dropped afterwards.
// Skipped when no server answers.

const URI = process.env.TEST_MONGODB_URI ?? "mongodb://127.0.0.1:27017/robtic-ticket-test";
const GUILD = "1100000000000000001";
let up = false;

beforeAll(async () => {
    try {
        await connectDatabase(URI);
        up = mongoose.connection.name.endsWith("-test");
    } catch {
        up = false;
    }
});

afterAll(async () => {
    if (up) await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
});

const it = (name: string, fn: () => Promise<void>) => test(name, async () => { if (up) await fn(); });

describe("the dashboard's documents, read by the bot", () => {
    it("settings saved by the dashboard (ticketsettings) are what the bot reads", async () => {
        const panel = newTicketPanel("Support");
        await TicketSettingsModel.updateOne({ guildId: GUILD }, { $set: { general: { language: "ar", prefix: "-", nextNumber: 41 }, panels: [panel] } }, { upsert: true });
        const s = await new SettingsRepository().get(GUILD);
        expect(s.general.language).toBe("ar");
        expect(s.general.prefix).toBe("-");
        expect(s.general.transcriptToOwner).toBe(true); // a default for what the dashboard didn't send
        expect(s.panels[0]!.options[0]!.label).toBe("Support");
    });
    it("ticket numbers start at the dashboard's number and never repeat", async () => {
        const repo = new SettingsRepository();
        expect(await repo.nextNumber(GUILD)).toBe(41);
        expect(await repo.nextNumber(GUILD)).toBe(42);
    });
    it("a post request from the dashboard is picked up once", async () => {
        await PanelPostModel.updateOne({ guildId: GUILD, panelId: "p1" }, { $set: { guildId: GUILD, panelId: "p1", requestedAt: new Date(), doneAt: null, error: null } }, { upsert: true });
        const posts = new PanelPostRepository();
        expect((await posts.pending()).map((p) => p.panelId)).toContain("p1");
        await posts.done(GUILD, "p1");
        expect((await posts.pending()).map((p) => p.panelId)).not.toContain("p1");
    });
});

describe("tickets and transcripts", () => {
    it("the per-member limit counts open tickets of one option", async () => {
        const tickets = new TicketRepository();
        const option = { ...newTicketOption("Support"), id: "opt1", perMember: 1 };
        expect(await overLimit(GUILD, "u1", option)).toBeNull();
        await tickets.create({ guildId: GUILD, channelId: "c1", channelName: "ticket-0041", number: 41, panelId: "p1", panelName: "Support", optionId: "opt1", optionLabel: "Support", ownerId: "u1", answers: [{ question: "Why?", answer: "Help" }] });
        expect(await overLimit(GUILD, "u1", option)).toEqual(["c1"]);
        expect(await overLimit(GUILD, "u1", { ...option, perMember: 0 })).toBeNull();
    });
    it("messages, edits, reactions and deletes fold into the transcript", async () => {
        const tr = new TranscriptRepository();
        const author = { id: "u1", username: "layla", globalName: null, displayName: "Layla", avatarUrl: null, bot: false, system: false };
        await tr.upsertMessage("m1", { guildId: GUILD, channelId: "c1", author, content: "hello", messageCreatedAt: new Date(), isBot: false, attachments: [], embeds: [], stickers: [] });
        await tr.edit("c1", "m1", "hello", "hello there");
        await tr.upsertMessage("m1", { content: "hello there", editedAt: new Date() }, true);
        await tr.react("m1", { id: null, name: "👍", animated: false }, "u2", true);
        await tr.upsertMessage("m2", { guildId: GUILD, channelId: "c1", author, content: "oops", messageCreatedAt: new Date(), isBot: false, attachments: [], embeds: [], stickers: [] });
        await tr.markDeleted("m2", "c1", GUILD, { userId: "u1", kind: "self" });

        const guild = {
            id: GUILD,
            name: "Robtic Community",
            iconURL: () => null,
            members: { fetch: async () => { throw new Error("offline"); } },
            client: { users: { fetch: async () => { throw new Error("offline"); } } },
        } as never;
        const doc = await buildDocument(guild, "c1", "tr_test");
        expect(doc).not.toBeNull();
        expect(doc!.ticket.number).toBe(41);
        expect(doc!.ticket.answers).toEqual([{ question: "Why?", answer: "Help" }]);
        const [m1, m2] = doc!.messages;
        expect(m1!.content).toBe("hello there");
        expect(m1!.revision).toBe(1);
        expect(m1!.editHistory[0]).toMatchObject({ before: "hello", after: "hello there" });
        expect(m1!.reactions![0]!.userIds).toEqual(["u2"]);
        expect(m2!.deleted).toBe(true);
        expect(m2!.deletedBy).toEqual({ userId: "u1", kind: "self" });
        expect(doc!.stats).toMatchObject({ messageCount: 2, deletedCount: 1, editedCount: 1 });
        expect(doc!.users.u1!.displayName).toBe("Layla");
    });
});
