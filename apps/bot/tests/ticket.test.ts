import { describe, expect, test } from "bun:test";
import { defaultCommands, defaultTicketControls, missingArabic, durationText, newButton, newInfoBlock, newInfoItem, newPanel, resolveLifecycle, resolveManagerRoles, resolveSupportRoles, newQuestion, normalizeTicketSettings, newTicketOption, newTicketPanel, overwriteBits, t, validateTicketPanel } from "@robo/shared";
import { mentionedId, parseCommand } from "../src/handlers/message.hendler";
import { emojiOf, renderMessage } from "../src/lib/messagePayload";
import { controlRows } from "../src/Permissions/buttons";
import { infoPanelOf } from "../src/ticket/types";
import { showcaseTranscript } from "../../transcript/src/showcase";
import { transcriptHtml } from "@robo/transcript/html";

describe("both languages", () => {
    test("every English line has an Arabic one", () => {
        expect(missingArabic()).toEqual([]);
    });
    test("lines fill in their words", () => {
        expect(t("ar", "claimed", { user: "<@1>" })).toBe("🙋 تولّى <@1> هذه التذكرة.");
        expect(t("en", "open.created", { channel: "<#2>" })).toContain("<#2>");
    });
});

describe("typed commands", () => {
    test("English and Arabic words, with their argument", () => {
        expect(parseCommand("!close done here", "!")).toEqual({ command: "close", enabled: true, rest: "done here" });
        expect(parseCommand("!اغلاق", "!")).toEqual({ command: "close", enabled: true, rest: "" });
        expect(parseCommand("-تسمية vip-room", "-")).toEqual({ command: "rename", enabled: true, rest: "vip-room" });
        expect(parseCommand("!تعال <@1>", "!")?.command).toBe("come");
        expect(parseCommand("!hello", "!")).toBeNull();
        expect(parseCommand("close", "!")).toBeNull();
    });
    test("the server's extra words, and commands turned off", () => {
        const commands = defaultCommands();
        commands.close = { enabled: false, aliases: ["done"] };
        expect(parseCommand("!done thanks", "!", commands)).toEqual({ command: "close", enabled: false, rest: "thanks" });
        expect(parseCommand("!claim", "!", commands)?.enabled).toBe(true);
    });
    test("a mention or a bare id", () => {
        expect(mentionedId("<@!123456789012345678>")).toBe("123456789012345678");
        expect(mentionedId("123456789012345678")).toBe("123456789012345678");
        expect(mentionedId("nobody")).toBeNull();
    });
});

describe("permissions", () => {
    test("an overwrite becomes Discord's allow / deny bits", () => {
        const { allow, deny } = overwriteBits({ ViewChannel: "allow", SendMessages: "allow", MentionEveryone: "deny" });
        expect(BigInt(allow)).toBe((1n << 10n) | (1n << 11n));
        expect(BigInt(deny)).toBe(1n << 17n);
    });
});

describe("messages", () => {
    test("an embed with its text above, words filled in, and the slot under it", () => {
        const o = newTicketOption("Support");
        const p = renderMessage(o.welcome, { user: "<@1>", support: "<@&2>", option: "Support" }, [{ type: 1, components: [] }]);
        expect(p.content).toBe("<@1> <@&2>");
        expect((p.embeds![0] as { title: string }).title).toBe("Support");
        expect(p.components.length).toBe(1);
    });
    test("components: a container with the slot where it sits, and uploaded pictures as attachments", () => {
        const o = newTicketOption("Support");
        o.welcome.format = "components";
        o.welcome.blocks = [{ id: "i", type: "image", url: `data:image/png;base64,${Buffer.from("png").toString("base64")}` }, ...o.welcome.blocks];
        const p = renderMessage(o.welcome, {}, [{ type: 1, components: [] }]);
        expect(p.flags).toBe(1 << 15);
        const box = p.components[0] as { type: number; components: { type: number }[] };
        expect(box.type).toBe(17);
        expect(box.components.map((c) => c.type)).toEqual([12, 10, 14, 1]);
        expect(p.files![0]!.name).toBe("image-1.png");
    });
    test("server emoji and plain emoji", () => {
        expect(emojiOf("<a:dance:123456789012345678>")).toEqual({ id: "123456789012345678", name: "dance", animated: true });
        expect(emojiOf("🎫")).toEqual({ name: "🎫" });
    });
});

describe("ticket controls", () => {
    test("Close always shows; hidden controls are left out; a menu holds them all", () => {
        const c = defaultTicketControls();
        c.items.close.shown = false;
        c.items.rename.shown = false;
        const ids = controlRows(c, false).flatMap((r) => r.components.map((b) => b.custom_id));
        expect(ids).toContain("tk:c:close");
        expect(ids).not.toContain("tk:c:rename");
        expect(ids).not.toContain("tk:c:transfer");
        for (const a of ["reopen", "transcript", "delete"] as const) c.items[a].closedPlacement = "menu";
        const [row] = controlRows(c, true);
        const menu = row!.components[0] as { custom_id: string; options: { value: string }[] };
        expect(menu.custom_id).toBe("tk:cm");
        expect(menu.options.map((o) => o.value)).toEqual(["reopen", "transcript", "delete"]);
    });
});

describe("the dashboard's rules", () => {
    test("a new panel is valid; Close can't be hidden", () => {
        const p = newTicketPanel("Support");
        expect(validateTicketPanel(p)).toEqual([]);
        p.options[0]!.controls.items.close.shown = false;
        expect(validateTicketPanel(p).join(" ")).toContain("Close");
    });
});

describe("closing and pictures", () => {
    test("an option uses the server's values unless it sets its own", () => {
        const s = normalizeTicketSettings({ general: { lifecycle: { autoDeleteSeconds: 300, maxImages: 10 } } });
        expect(s.general.lifecycle).toEqual({ transcriptOnDelete: true, autoDeleteSeconds: 300, closeConfirm: "" });
        const o = newTicketOption("A");
        expect(resolveLifecycle(s.general, o).autoDeleteSeconds).toBe(300);
        o.lifecycle = { ...o.lifecycle, autoDeleteSeconds: 0, closeConfirm: "Sure?" };
        expect(resolveLifecycle(s.general, o)).toMatchObject({ autoDeleteSeconds: 0, closeConfirm: "Sure?", transcriptOnDelete: true });
        expect(normalizeTicketSettings({ panels: [{ ...newTicketPanel("P") }] }).panels[0]!.options[0]!.lifecycle.autoDeleteSeconds).toBeNull();
    });
    test("durations read naturally in both languages", () => {
        expect(durationText(45)).toBe("45 seconds");
        expect(durationText(300)).toBe("5 minutes");
        expect(durationText(3600)).toBe("1 hour");
        expect(durationText(172800, "ar")).toBe("2 يوم");
    });
    test("limits are checked", () => {
        const p = newTicketPanel("P");
        p.options[0]!.lifecycle.autoDeleteSeconds = 999_999_999;
        expect(validateTicketPanel(p).join(" ")).toContain("auto-delete");
    });
});

describe("round 4", () => {
    const fakeGuild = { roles: { everyone: { id: "1" } }, members: { me: null } } as never;
    test("a claimed ticket uses the claimed permissions only when they're turned on", async () => {
        const { ticketOverwrites } = await import("../src/Permissions/permissions");
        const o = newTicketOption("A");
        o.supportRoleIds = ["50"];
        const text = (v: unknown) => JSON.stringify(v, (_k, x) => (typeof x === "bigint" ? x.toString() : x));
        const support = (claimerId: string | null) => text((ticketOverwrites(fakeGuild, o, { ownerId: "9", claimerId, addedIds: [] }) as { id: string }[]).find((x) => x.id === "50"));
        const openSupport = support("8");
        o.permissions.useClaimed = true;
        expect(support("8")).not.toBe(openSupport);
        expect(support(null)).toBe(openSupport);
    });
    test("the controls' menu goes where its own block sits; without one it follows the buttons", () => {
        const c = defaultTicketControls();
        c.items.rename.placement = "menu";
        const m = { ...newTicketPanel("P").message, format: "components" as const };
        m.blocks = [{ id: "slotMenu", type: "slotMenu" }, { id: "t", type: "text", content: "Hi" }, { id: "slot", type: "slot" }];
        const kids = (renderMessage(m, {}, controlRows(c, false)).components[0] as { components: { type: number; components?: { type: number }[] }[] }).components;
        expect(kids[0]!.components![0]!.type).toBe(3);
        expect(kids[1]!.type).toBe(10);
        expect(kids[2]!.components![0]!.type).toBe(2);
    });
    test("a panel is all buttons or all menu, and info buttons sit beside its buttons", async () => {
        const { panelPayload } = await import("../src/ticket/TicketEmbed");
        const p = newTicketPanel("P");
        p.infoButtons = [{ ...newInfoItem("ip1", "Rules"), id: "n1" }];
        const g = { name: "S" } as never;
        expect(JSON.stringify(panelPayload(p, g).components)).toContain("tk:v:ip1:n1");
        p.display = "menu";
        const json = JSON.stringify(panelPayload(p, g).components);
        expect(json).toContain("tk:m:");
        expect(json).not.toContain("tk:v:ip1:n1");
        expect(normalizeTicketSettings({ panels: [{ ...newTicketPanel("Old"), display: undefined, options: [{ ...newTicketOption("A"), placement: "menu" }] }] }).panels[0]!.display).toBe("menu");
    });
});

describe("transcript file", () => {
    test("the HTML file renders the conversation with no scripts", async () => {
        const html = await transcriptHtml(showcaseTranscript("tr_showcase"));
        expect(html.startsWith("<!doctype html>")).toBe(true);
        expect(html).toContain("#report-0128");
        expect(html).toContain("oops, wrong screenshot");
        expect(html).not.toContain("<script");
    });
});

describe("round 2", () => {
    test("older settings (one permission set, closeReason) become the new shape", () => {
        const old = { general: { language: "ar", closeReason: true }, panels: [{ ...newTicketPanel("Old"), options: [{ ...newTicketOption("A"), permissions: { targets: { everyone: { ViewChannel: "deny" } }, roles: {}, closedOwner: "hidden" }, controls: { display: "menu", items: {} } }] }] };
        const s = normalizeTicketSettings(old);
        const o = s.panels[0]!.options[0]!;
        expect(o.permissions.open.targets.everyone).toEqual({ ViewChannel: "deny" });
        expect(o.permissions.closed.targets.owner).toEqual({ ViewChannel: "deny" });
        expect(o.controls.items.close.reason).toBe(true);
        // The old "all in a menu" became every control placed in the menu.
        expect(o.controls.items.close.placement).toBe("menu");
        expect(o.controls.items.delete.placement).toBe("button");
        expect(s.commands.come.enabled).toBe(true);
        expect(s.come.button.label).toBe("Go to the ticket");
    });
    test("controls mix buttons and a menu: Rename and Close in the menu, the rest buttons", () => {
        const c = defaultTicketControls();
        c.items.rename.placement = "menu";
        c.items.close.placement = "menu";
        const rows = controlRows(c, false);
        const last = rows[rows.length - 1]!.components[0] as { type: number; options: { value: string }[] };
        expect(last.type).toBe(3);
        expect(last.options.map((o) => o.value)).toEqual(["close", "rename"]);
        const buttons = rows.slice(0, -1).flatMap((r) => r.components.map((b) => b.custom_id));
        expect(buttons).toContain("tk:c:claim");
        expect(buttons).not.toContain("tk:c:close");
    });
    test("the closed message places its controls apart: Transcript in its menu, still a button when open", () => {
        const c = defaultTicketControls();
        c.items.transcript.closedPlacement = "menu";
        const closedIds = controlRows(c, true).flatMap((r) => r.components.map((b) => b.custom_id));
        expect(closedIds).not.toContain("tk:c:transcript");
        expect(closedIds).toContain("tk:cm");
        expect(controlRows(c, false).flatMap((r) => r.components.map((b) => b.custom_id))).toContain("tk:c:transcript");
    });
    test("an info block renders as its own buttons or menu in a Components message", () => {
        const m = { ...newTicketPanel("P").message, format: "components" as const };
        m.blocks = [...m.blocks, { ...newInfoBlock("ip1", "Rules"), id: "v1", items: [{ ...newInfoItem("ip1", "Rules"), id: "n1" }] }];
        const ids = JSON.stringify(renderMessage(m, {}, []).components);
        expect(ids).toContain("tk:v:ip1:n1");
        m.blocks = m.blocks.map((b) => (b.type === "info" ? { ...b, display: "menu" as const } : b));
        const json = JSON.stringify(renderMessage(m, {}, []).components);
        expect(json).toContain("tk:vm:v1");
        expect(json).toContain("v:ip1:n1");
        expect(infoPanelOf("v:ip2:n2")).toBe("ip2");
        expect(infoPanelOf("close")).toBe(null);
    });
    test("first-version info buttons move into an info block; old closed display becomes closedPlacement", () => {
        const old = newTicketPanel("Old");
        const raw = { panels: [{ ...old, info: [{ id: "n1", label: "FAQ", panelId: "ip1", placement: "button" }], options: [{ ...old.options[0], controls: { closedDisplay: "menu", items: {} } }] }] };
        const s = normalizeTicketSettings(raw);
        expect(s.panels[0]!.message.blocks.some((b) => b.type === "info")).toBe(true);
        expect(s.panels[0]!.options[0]!.controls.items.transcript.closedPlacement).toBe("menu");
        expect(s.panels[0]!.options[0]!.controls.items.transcript.placement).toBe("button");
    });
    test("an old panel shown as a menu keeps its options in the menu; a missing info panel is a dashboard error", () => {
        const old = newTicketPanel("Old");
        const s = normalizeTicketSettings({ panels: [{ ...old, display: "menu", options: old.options.map(({ placement: _p, ...o }) => o) }] });
        expect(s.panels[0]!.options[0]!.placement).toBe("menu");
        expect(s.infoPanels).toEqual([]);
        const p = newTicketPanel("New");
        p.message = { ...p.message, format: "components", blocks: [...p.message.blocks, { ...newInfoBlock(""), items: [newInfoItem("")] }] };
        expect(validateTicketPanel(p).join(" ")).toContain("choose the info panel");
    });
    test("an info panel renders with its own buttons, only for the member", async () => {
        const { infoPanelPayload } = await import("../src/ticket/infoPanels");
        const panel = { ...newPanel("FAQ"), id: "ip1", format: "embed" as const, embed: { ...newPanel().embed, title: "FAQ" }, rows: [{ id: "r", type: "buttons" as const, buttons: [{ ...newButton("More"), id: "b1" }] }] };
        const p = infoPanelPayload(panel, true);
        expect(p.flags! & 64).toBe(64);
        expect((p.components[0] as { components: { custom_id: string }[] }).components[0]!.custom_id).toBe("tk:x:ip1:b1");
        expect(infoPanelPayload(panel, false).flags).toBeUndefined();
    });
    test("every question kind becomes a label with the right Discord part", async () => {
        const { questionsModal } = await import("../src/ticket/TicketModalCreate");
        const o = newTicketOption("Report");
        o.questions = (["short", "select", "radio", "checkboxes", "checkbox"] as const).map((k) => newQuestion(k));
        const m = questionsModal("p1", o, "en");
        expect(m.components.map((c) => (c as unknown as { type: number; component: { type: number } }).component.type)).toEqual([4, 3, 21, 22, 23]);
        expect(m.components.every((c) => (c as { type: number }).type === 18)).toBe(true);
    });
});

describe("support roles cascade", () => {
    const settings = () => normalizeTicketSettings({ general: { supportRoleIds: ["900000000000000001"] } });
    test("an option without its own takes the panel's, else the server's", () => {
        const s = settings();
        const p = newTicketPanel();
        const o = newTicketOption();
        expect(resolveSupportRoles(s.general, p, o)).toEqual(["900000000000000001"]);
        p.supportRoleIds = ["900000000000000002"];
        expect(resolveSupportRoles(s.general, p, o)).toEqual(["900000000000000002"]);
        o.supportRoleIds = ["900000000000000003"];
        expect(resolveSupportRoles(s.general, p, o)).toEqual(["900000000000000003"]);
    });
    test("'no support roles' wins over the option's, the panel's and the server's", () => {
        const s = settings();
        const p = { ...newTicketPanel(), supportRoleIds: ["900000000000000002"] };
        const o = { ...newTicketOption(), supportRoleIds: ["900000000000000003"], noSupport: true };
        expect(resolveSupportRoles(s.general, p, o)).toEqual([]);
    });
    test("'No support roles' on the panel applies to its options without their own", () => {
        const s = settings();
        const p = { ...newTicketPanel(), noSupport: true };
        expect(resolveSupportRoles(s.general, p, newTicketOption())).toEqual([]);
        expect(resolveSupportRoles(s.general, p, { ...newTicketOption(), supportRoleIds: ["900000000000000003"] })).toEqual(["900000000000000003"]);
    });
    test("manager roles cascade the same way", () => {
        const s = normalizeTicketSettings({ general: { managerRoleIds: ["900000000000000009"] } });
        const p = newTicketPanel();
        expect(resolveManagerRoles(s.general, p, newTicketOption())).toEqual(["900000000000000009"]);
        expect(resolveManagerRoles(s.general, { ...p, managerRoleIds: ["900000000000000008"] }, newTicketOption())).toEqual(["900000000000000008"]);
        expect(resolveManagerRoles(s.general, p, { ...newTicketOption(), noManager: true })).toEqual([]);
    });
    test("older documents get the new fields", () => {
        const s = normalizeTicketSettings({ panels: [{ id: "p1", options: [{ id: "o1", label: "Help" }] }] });
        expect(s.general.supportRoleIds).toEqual([]);
        expect(s.panels[0]!.supportRoleIds).toEqual([]);
        expect(s.panels[0]!.options[0]!.noSupport).toBe(false);
        expect(s.general.managerRoleIds).toEqual([]);
        expect(s.panels[0]!.noManager).toBe(false);
    });
    test("Come and Sleep are shown in new options", () => {
        const c = defaultTicketControls();
        expect(c.items.come.shown).toBe(true);
        expect(c.items.sleep.shown).toBe(true);
    });
});
