import { SettingsRepository } from "@robo/db";
import { t, type Locale, type MessageKey } from "@robo/shared";

// The bot speaks each server's language (Settings → Bot language on the dashboard). Every reply goes through here.

const settings = new SettingsRepository();

export async function localeOf(guildId: string | null | undefined): Promise<Locale> {
    if (!guildId) return "en";
    return (await settings.get(guildId)).general.language;
}

/** A sentence in the server's language. */
export async function msg(guildId: string | null | undefined, key: MessageKey, vars?: Record<string, string | number>): Promise<string> {
    return t(await localeOf(guildId), key, vars);
}

export { t };
export type { Locale, MessageKey };
