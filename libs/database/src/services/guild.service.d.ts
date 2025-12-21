export declare class GuildService {
    ensureGuild(guildId: string): Promise<{
        id: string;
        createdAt: Date;
        config: import("libs/database/generated/prisma/runtime/library").JsonValue | null;
    } | undefined>;
}
