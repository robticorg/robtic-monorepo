import { prisma } from "@robo/db";
import { Logger } from "@robo/logger";

export class PermissionService {
    async findByAction(guildId: string, action: string) {
        try {
            return await prisma.permission.findUnique({
                where: { guildId_action: { guildId, action } },
            });

            Logger.database(`done find`)
        } catch (error) {
            Logger.error(`❌ Failed to find permission for ${action} in guild ${guildId}`, error);
            return null;
        }
    }

    async findAllByGuild(guildId: string) {
        try {
            return await prisma.permission.findMany({
                where: { guildId },
            });
        } catch (error) {
            Logger.error(`❌ Failed to find permissions for guild ${guildId}`, error);
            return [];
        }
    }

    async upsert(guildId: string, action: string, permissions: string[], roleIds: string[]) {
        try {
            const result = await prisma.permission.upsert({
                where: { guildId_action: { guildId, action } },
                update: { permissions, roleIds },
                create: { guildId, action, permissions, roleIds },
            });
            Logger.database(`✅ Permission upserted: ${action} for guild ${guildId}`);
            return result;
        } catch (error) {
            Logger.error(`❌ Failed to upsert permission for ${action} in guild ${guildId}`, error);
            return null;
        }
    }

    async delete(guildId: string, action: string) {
        try {
            await prisma.permission.delete({
                where: { guildId_action: { guildId, action } },
            });
            Logger.database(`🗑️ Permission deleted: ${action} for guild ${guildId}`);
        } catch (error) {
            Logger.error(`❌ Failed to delete permission for ${action}`, error);
        }
    }

    async seedDefaults(guildId: string, defaults: { action: string; permissions: string[]; roleIds: string[] }[]) {
        try {
            for (const def of defaults) {
                await prisma.permission.upsert({
                    where: { guildId_action: { guildId, action: def.action } },
                    update: {},   // don't overwrite existing customisations
                    create: {
                        guildId,
                        action: def.action,
                        permissions: def.permissions,
                        roleIds: def.roleIds,
                    },
                });
            }
            Logger.database(`✅ Default permissions seeded for guild ${guildId}`);
        } catch (error) {
            Logger.error(`❌ Failed to seed permissions for guild ${guildId}`, error);
        }
    }
}
