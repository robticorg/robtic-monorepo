import type { Client, TextChannel } from "discord.js";
import { Logger } from "@robo/logger";
import { TicketRepository } from "@robo/db";
import { closeForNoAnswer, remindOwner } from ".";
import { contextOf } from "./utils";

// Sleep, every minute: open tickets whose last message isn't the owner's get the reminder after the Sleep page's
// reminder time (when automatic sleep is on), and close after its close time (or at the time /sleep set).

const tickets = new TicketRepository();
let timer: ReturnType<typeof setInterval> | null = null;
let busy = false;

async function sweep(client: Client) {
    if (busy) return;
    busy = true;
    try {
        const now = Date.now();
        for (const tk of await tickets.waitingOnOwner()) {
            const guild = client.guilds.cache.get(tk.guildId);
            if (!guild) continue;
            const ctx = await contextOf(tk.guildId, tk.channelId);
            if (!ctx) continue;
            const z = ctx.settings.sleep;
            const channel = (guild.channels.cache.get(tk.channelId) ?? null) as TextChannel | null;
            if (!channel) continue;
            const quiet = tk.ownerQuietSince ? new Date(tk.ownerQuietSince).getTime() : null;
            const closeAt = tk.sleepCloseAt ? new Date(tk.sleepCloseAt).getTime() : z.enabled && quiet ? quiet + z.closeMinutes * 60_000 : null;
            if (closeAt && closeAt <= now) {
                await closeForNoAnswer(channel, ctx).catch((e) => Logger.warn(`[sleep] close ${tk.channelId}: ${e}`));
                continue;
            }
            if (z.enabled && quiet && !tk.sleepRemindedAt && quiet + z.reminderMinutes * 60_000 <= now) {
                await remindOwner(channel, ctx, null, false).catch((e) => Logger.warn(`[sleep] remind ${tk.channelId}: ${e}`));
            }
        }
    } catch (err) {
        Logger.error("[sleep] sweep failed", err);
    } finally {
        busy = false;
    }
}

export function startSleep(client: Client) {
    if (timer) return;
    timer = setInterval(() => void sweep(client), 60_000);
    void sweep(client);
}
