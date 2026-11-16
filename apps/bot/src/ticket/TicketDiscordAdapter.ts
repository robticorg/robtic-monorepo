import { ChannelType, type Guild, type OverwriteResolvable, type TextChannel } from "discord.js";
import { Logger } from "@robo/logger";

// The few Discord calls tickets need, each failing softly (null / false) so a missing permission becomes a clear reply.

/** Discord channel names: lower case, no spaces, at most 100 characters. */
export const channelSlug = (name: string) => name.toLowerCase().replace(/\s+/g, "-").replace(/[^\p{L}\p{N}_-]+/gu, "").replace(/-+/g, "-").slice(0, 100) || "ticket";

export class TicketDiscordAdapter {
    async createChannel(guild: Guild, name: string, parentId: string | null, overwrites: OverwriteResolvable[], topic: string): Promise<TextChannel | null> {
        try {
            const parent = parentId ? guild.channels.cache.get(parentId) : null;
            return await guild.channels.create({
                name: channelSlug(name),
                type: ChannelType.GuildText,
                parent: parent?.type === ChannelType.GuildCategory ? parent.id : undefined,
                permissionOverwrites: overwrites,
                topic: topic.slice(0, 1024),
            });
        } catch (err) {
            Logger.error(`[Ticket] couldn't create a channel in ${guild.id}`, err);
            return null;
        }
    }

    /** One retry after a short wait: a dropped connection would otherwise leave a claim or close without its permissions. */
    async setOverwrites(channel: TextChannel, overwrites: OverwriteResolvable[]): Promise<boolean> {
        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
                await channel.permissionOverwrites.set(overwrites);
                return true;
            } catch (err) {
                if (attempt === 2) Logger.error(`[Ticket] couldn't set permissions on ${channel.id}`, err);
                else await new Promise((r) => setTimeout(r, 1500));
            }
        }
        return false;
    }

    /** Discord allows 2 renames per channel every 10 minutes: false when that limit is hit. */
    async rename(channel: TextChannel, name: string): Promise<boolean> {
        const done = channel.setName(channelSlug(name)).then(() => true).catch(() => false);
        const slow = new Promise<boolean>((r) => setTimeout(() => r(false), 4000));
        return Promise.race([done, slow]);
    }

    /** Moves the channel to a category, keeping its own permissions (closed tickets → the closed category). */
    async move(channel: TextChannel, parentId: string | null): Promise<boolean> {
        if (!parentId || channel.parentId === parentId) return true;
        const parent = channel.guild.channels.cache.get(parentId);
        if (parent?.type !== ChannelType.GuildCategory) return false;
        return channel.setParent(parent.id, { lockPermissions: false }).then(() => true).catch((err) => { Logger.warn(`[Ticket] couldn't move ${channel.id}: ${err}`); return false; });
    }

    async deleteChannel(channel: TextChannel): Promise<boolean> {
        return channel.delete("Ticket deleted").then(() => true).catch(() => false);
    }
}
