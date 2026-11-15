import type { Client, TextChannel } from "discord.js";
import { Logger } from "@robo/logger";
import { SettingsRepository, TicketRepository } from "@robo/db";
import { resolveLifecycle } from "@robo/shared";
import { archiveTicket } from "./transcript/archive";

// Auto-delete after closing: closing writes `deleteAt` on the ticket; every 30 seconds this deletes the channels whose
// time has come (saving the transcript first when the option wants it). Kept in the database, so a restart loses
// nothing; reopening clears it.

const tickets = new TicketRepository();
const settings = new SettingsRepository();
let timer: ReturnType<typeof setInterval> | null = null;
let busy = false;

async function sweep(client: Client) {
    if (busy) return;
    busy = true;
    try {
        for (const tk of await tickets.dueForDelete()) {
            const guild = client.guilds.cache.get(tk.guildId);
            if (!guild) continue;
            await tickets.update(tk.channelId, { deleteAt: null });
            const channel = (guild.channels.cache.get(tk.channelId) ?? (await guild.channels.fetch(tk.channelId).catch(() => null))) as TextChannel | null;
            if (!channel) continue;
            const s = await settings.get(tk.guildId);
            const panel = s.panels.find((p) => p.id === tk.panelId) ?? null;
            const option = panel?.options.find((o) => o.id === tk.optionId) ?? null;
            if (resolveLifecycle(s.general, option).transcriptOnDelete) await archiveTicket(guild, tk.channelId, { post: false }).catch(() => null);
            await channel.delete("Auto-delete after closing").catch((e) => Logger.warn(`[auto-delete] ${tk.channelId}: ${e}`));
            Logger.info(`[auto-delete] deleted ticket #${tk.number} (${tk.channelId}) in ${tk.guildId}`);
        }
    } catch (err) {
        Logger.error("[auto-delete] sweep failed", err);
    } finally {
        busy = false;
    }
}

export function startAutoDelete(client: Client) {
    if (timer) return;
    timer = setInterval(() => void sweep(client), 30_000);
    void sweep(client);
}
