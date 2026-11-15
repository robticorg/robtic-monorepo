import type { Client } from "discord.js";
import env from "@robo/config";
import { Logger } from "@robo/logger";
import { PanelPostRepository, SettingsRepository } from "@robo/db";
import { panelPayload } from "./TicketEmbed";

// The dashboard's "Post" button: it leaves a request in `panelposts`; this picks requests up every few seconds, posts
// the panel in its channel (or edits it where it already is) and writes back where, so the dashboard shows "Posted".

const posts = new PanelPostRepository();
const settings = new SettingsRepository();
let timer: ReturnType<typeof setInterval> | null = null;
let busy = false;

async function postOne(client: Client, guildId: string, panelId: string): Promise<string | null> {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) return "The bot isn't in that server.";
    settings.forget(guildId);
    const panel = (await settings.get(guildId)).panels.find((p) => p.id === panelId);
    if (!panel) return "That panel no longer exists.";
    if (!panel.channelId) return "The panel has no channel.";
    const channel = guild.channels.cache.get(panel.channelId) ?? (await guild.channels.fetch(panel.channelId).catch(() => null));
    if (!channel?.isSendable() || !channel.isTextBased()) return "The bot can't post in that channel.";
    const payload = panelPayload(panel, guild);

    // Already posted in this channel: edit that message (a switch between embed and components needs a new one).
    if (panel.posted?.channelId === channel.id) {
        const old = await channel.messages.fetch(panel.posted.messageId).catch(() => null);
        const sameKind = old && Boolean(old.flags.bitfield & (1 << 15)) === Boolean(payload.flags);
        if (old && sameKind) {
            await old.edit({ ...payload, attachments: [] } as never);
            await settings.setPosted(guildId, panelId, { channelId: channel.id, messageId: old.id, at: new Date().toISOString() });
            return null;
        }
        await old?.delete().catch(() => null);
    }
    const sent = await channel.send(payload as never);
    await settings.setPosted(guildId, panelId, { channelId: channel.id, messageId: sent.id, at: new Date().toISOString() });
    return null;
}

export function startPanelPoster(client: Client) {
    if (timer) return;
    const tick = async () => {
        if (busy) return;
        busy = true;
        try {
            for (const p of await posts.pending()) {
                const error = await postOne(client, p.guildId, p.panelId).catch((e: Error) => e.message);
                await posts.done(p.guildId, p.panelId, error);
                if (error) Logger.warn(`[panels] ${p.guildId}/${p.panelId}: ${error}`);
                else Logger.info(`[panels] posted ${p.panelId} in ${p.guildId}`);
            }
        } catch (err) {
            Logger.error("[panels] poll failed", err);
        } finally {
            busy = false;
        }
    };
    timer = setInterval(tick, Math.max(2, env.panelPollSeconds) * 1000);
    void tick();
}
