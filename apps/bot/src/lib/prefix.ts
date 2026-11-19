import { TICKET_LIMITS } from "@robo/shared";

// Changing the typed-command prefix from Discord (/prefix, or the old prefix + "prefix"), the same setting as the
// dashboard's General → Command prefix. Only members with Manage Server may change it; anyone may see it.

export type PrefixCheck = { ok: true; prefix: string } | { ok: false; reason: "empty" | "long" | "space" };

export function checkPrefix(raw: string): PrefixCheck {
    const prefix = raw.trim();
    if (!prefix) return { ok: false, reason: "empty" };
    if (/\s/.test(prefix)) return { ok: false, reason: "space" };
    if ([...prefix].length > TICKET_LIMITS.prefix) return { ok: false, reason: "long" };
    return { ok: true, prefix };
}

const both = (en: string, ar: string) => `${en}\n${ar}`;

export const prefixText = {
    current: (p: string) => both(`The prefix here is \`${p}\` — e.g. \`${p}close\`. Slash commands always work.`, `البادئة هنا \`${p}\` — مثلاً \`${p}اغلاق\`. أوامر السلاش تعمل دائماً.`),
    changed: (p: string) => both(`Prefix changed to \`${p}\` — e.g. \`${p}close\`.`, `تم تغيير البادئة إلى \`${p}\` — مثلاً \`${p}اغلاق\`.`),
    noPermission: () => both("You need **Manage Server** to change the prefix.", "تحتاج صلاحية **إدارة السيرفر** لتغيير البادئة."),
    invalid: (r: "empty" | "long" | "space") =>
        r === "long"
            ? both(`A prefix can be up to ${TICKET_LIMITS.prefix} characters.`, `البادئة حتى ${TICKET_LIMITS.prefix} أحرف.`)
            : r === "space"
              ? both("A prefix can't contain spaces.", "لا يمكن أن تحتوي البادئة على مسافات.")
              : both("Give the new prefix, e.g. `/prefix ?`.", "اكتب البادئة الجديدة، مثلاً `/prefix ?`."),
};

/** "prefix" and its Arabic word, typed after the current prefix: `!prefix ?` / `!بادئة ?`. */
export function parsePrefixCommand(content: string, prefix: string): { rest: string } | null {
    if (!prefix || !content.startsWith(prefix)) return null;
    const body = content.slice(prefix.length).trim();
    const m = /^(prefix|بادئة|البادئة)(?:\s+(.*))?$/iu.exec(body);
    return m ? { rest: (m[2] ?? "").trim() } : null;
}
