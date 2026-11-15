import type { Guild } from "discord.js";
import { Logger } from "@robo/logger";
import { SettingsRepository } from "@robo/db";
import { t, type MessageKey } from "@robo/shared";

// The log channel: one line per open, claim, close, reopen and delete. Which channel is the ticket option's, else its
// panel's, else the server's (resolved by the caller with resolvePlaces); null: no log.
const settings = new SettingsRepository();

export class TicketAuditService {
    async log(guild: Guild, channelId: string | null, key: MessageKey, vars: Record<string, string>) {
        if (!channelId) return;
        const s = await settings.get(guild.id);
        try {
            const channel = guild.channels.cache.get(channelId) ?? (await guild.channels.fetch(channelId).catch(() => null));
            if (channel?.isSendable()) await channel.send({ content: t(s.general.language, key, vars), allowedMentions: { parse: [] } });
        } catch (err) {
            Logger.warn(`[TicketLog] ${guild.id}: ${(err as Error).message}`);
        }
    }
}
