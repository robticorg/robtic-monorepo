import { ComponentType, type APIModalInteractionResponseCallbackData, type ModalSubmitInteraction } from "discord.js";
import { t, type Locale, type TicketAction, type TicketOption, type TicketQuestion } from "@robo/shared";
import type { Row } from "@/lib/messagePayload";
import { IDS } from "./types";

// The popups, with Discord's newer popup parts: every question is a label (title and a short description) holding a
// text box, a menu, radio buttons, checkboxes, a single checkbox, a member or role picker, or a file upload. Also the
// new name for Rename, the reason for Close, and the member to add, remove or hand the ticket to.

type Modal = APIModalInteractionResponseCallbackData;
type Label = Modal["components"][number];

const cut = (s: string, n: number) => s.slice(0, n);
const label = (q: Pick<TicketQuestion, "label" | "description">, component: Record<string, unknown>): Label =>
    ({ type: ComponentType.Label, label: cut(q.label, 45) || "?", ...(q.description.trim() ? { description: cut(q.description, 100) } : {}), component } as unknown as Label);

function questionPart(q: TicketQuestion): Label {
    const id = q.id;
    const hint = q.placeholder.trim() ? { placeholder: cut(q.placeholder, 100) } : {};
    const picks = { min_values: q.required ? Math.max(1, q.min) : 0, max_values: Math.max(1, q.max), required: q.required };
    const choices = q.choices.map((c) => ({ value: c.id, label: cut(c.label, 100) || "?", ...(c.description.trim() ? { description: cut(c.description, 100) } : {}) }));
    switch (q.kind) {
        case "short":
        case "paragraph":
            return label(q, {
                type: ComponentType.TextInput, custom_id: id, style: q.kind === "paragraph" ? 2 : 1, required: q.required,
                max_length: Math.min(Math.max(q.max, 1), 4000), ...(q.min > 0 ? { min_length: Math.min(q.min, q.max) } : {}), ...hint,
            });
        case "select":
            return label(q, { type: ComponentType.StringSelect, custom_id: id, options: choices.slice(0, 25), ...picks, max_values: Math.min(picks.max_values, choices.length || 1), ...hint });
        case "user":
            return label(q, { type: ComponentType.UserSelect, custom_id: id, ...picks, ...hint });
        case "role":
            return label(q, { type: ComponentType.RoleSelect, custom_id: id, ...picks, ...hint });
        case "radio":
            return label(q, { type: 21, custom_id: id, options: choices.slice(0, 10), required: q.required });
        case "checkboxes":
            return label(q, { type: 22, custom_id: id, options: choices.slice(0, 10), min_values: q.required ? Math.max(1, q.min) : 0, max_values: Math.min(Math.max(1, q.max), choices.length || 1), required: q.required });
        case "checkbox":
            return label(q, { type: 23, custom_id: id });
        case "file":
            return label(q, { type: 19, custom_id: id, min_values: q.required ? 1 : 0, max_values: Math.min(Math.max(1, q.max), 10), required: q.required });
    }
}

export function questionsModal(panelId: string, option: TicketOption, locale: Locale): Modal {
    return {
        custom_id: IDS.form(panelId, option.id),
        title: cut(t(locale, "open.formTitle", { option: option.label || "Ticket" }), 45),
        components: option.questions.slice(0, 5).map(questionPart),
    };
}

/** One answer as text for the ticket and the transcript (names for choices, mentions for members and roles, links for files). */
export function answerOf(q: TicketQuestion, i: ModalSubmitInteraction, locale: Locale): string {
    const f = i.fields;
    const choice = (id: string) => q.choices.find((c) => c.id === id)?.label ?? id;
    try {
        switch (q.kind) {
            case "short":
            case "paragraph": return f.getTextInputValue(q.id);
            case "select": return f.getStringSelectValues(q.id).map(choice).join(", ");
            case "radio": { const v = f.getRadioGroup(q.id); return v ? choice(v) : ""; }
            case "checkboxes": return f.getCheckboxGroup(q.id).map(choice).join(", ");
            case "checkbox": return t(locale, f.getCheckbox(q.id) ? "answer.yes" : "answer.no");
            case "user": return [...(f.getSelectedUsers(q.id)?.keys() ?? [])].map((id) => `<@${id}>`).join(" ");
            case "role": return [...(f.getSelectedRoles(q.id)?.keys() ?? [])].map((id) => `<@&${id}>`).join(" ");
            case "file": return [...(f.getUploadedFiles(q.id)?.values() ?? [])].map((a) => a.url).join("\n");
        }
    } catch {
        return "";
    }
}

export function renameModal(current: string, locale: Locale): Modal {
    return {
        custom_id: IDS.rename,
        title: t(locale, "rename.title"),
        components: [label({ label: t(locale, "rename.label"), description: "" }, { type: ComponentType.TextInput, custom_id: "name", style: 1, required: true, max_length: 90, value: cut(current, 90) })],
    };
}

export function closeReasonModal(locale: Locale): Modal {
    return {
        custom_id: IDS.closeReason,
        title: t(locale, "close.reasonTitle"),
        components: [label({ label: t(locale, "close.reasonLabel"), description: "" }, { type: ComponentType.TextInput, custom_id: "reason", style: 2, required: false, max_length: 500, placeholder: t(locale, "close.reasonHint") })],
    };
}

/** Add, Remove and Transfer from a button: a popup with a member picker. */
export function memberModal(what: "add" | "remove" | "transfer", locale: Locale): Modal {
    return {
        custom_id: IDS.memberForm(what),
        title: t(locale, "pick.title"),
        components: [label({ label: cut(t(locale, `pick.${what}`), 45), description: "" }, { type: ComponentType.UserSelect, custom_id: "member", min_values: 1, max_values: 1, required: true })],
    };
}

/** "Are you sure?" for Close and Delete when the option asks for it. */
export function confirmRow(action: TicketAction, locale: Locale): Row {
    return { type: 1, components: [{ type: 2, style: 4, custom_id: IDS.confirm(action), label: t(locale, "confirm.yes") }] };
}
