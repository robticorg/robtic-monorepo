/**
 * Seed script — creates test data for a single guild.
 *
 * Usage:
 *   bun run prisma/seed.ts
 *   (or)  bunx prisma db seed
 */

import { PrismaClient, PanelType, TicketStatus } from "../generated/prisma";

const prisma = new PrismaClient();

// ─── Config ────────────────────────────────────────────
const GUILD_ID = "1304497912541216819";
const TEST_ROLE_ID = "1312415192617058425";  // Fake "Staff" role ID for testing

/**
 * Default permission rows – one per action.
 * `permissions` = Discord permission flag names (strings).
 * `roleIds`     = Discord role IDs that bypass the permission check.
 */
const DEFAULT_PERMISSIONS: { action: string; permissions: string[]; roleIds: string[] }[] = [
    { action: "close",      permissions: ["ManageChannels"],  roleIds: [TEST_ROLE_ID] },
    { action: "reopen",     permissions: ["ManageChannels"],  roleIds: [TEST_ROLE_ID] },
    { action: "delete",     permissions: ["ManageChannels"],  roleIds: [TEST_ROLE_ID] },
    { action: "manage",     permissions: ["ManageChannels"],  roleIds: ["1321791118047969310"] },
    { action: "claim",      permissions: ["SendMessages"],    roleIds: [TEST_ROLE_ID] },
    { action: "transcript", permissions: ["SendMessages"],    roleIds: [TEST_ROLE_ID] },
    { action: "add",        permissions: ["ManageChannels"],  roleIds: [TEST_ROLE_ID] },
    { action: "remove",     permissions: ["ManageChannels"],  roleIds: [TEST_ROLE_ID] },
    { action: "rename",     permissions: ["ManageChannels"],  roleIds: [TEST_ROLE_ID] },
    { action: "transfer",   permissions: ["ManageChannels"],  roleIds: [TEST_ROLE_ID] },
];

// ─── Main ──────────────────────────────────────────────

async function main() {
    console.log("🌱 Seeding database…\n");

    // 1. Guild
    const guild = await prisma.guild.upsert({
        where: { id: GUILD_ID },
        update: {},
        create: {
            id: GUILD_ID,
            config: {
                prefix: "!",
                locale: "en",
                logsChannelId: null,
            },
        },
    });
    console.log(`  ✔ Guild: ${guild.id}`);

    // 2. Permissions
    for (const perm of DEFAULT_PERMISSIONS) {
        await prisma.permission.upsert({
            where: { guildId_action: { guildId: GUILD_ID, action: perm.action } },
            update: { permissions: perm.permissions, roleIds: perm.roleIds },
            create: {
                guildId: GUILD_ID,
                action: perm.action,
                permissions: perm.permissions,
                roleIds: perm.roleIds,
            },
        });
    }
    console.log(`  ✔ Permissions: ${DEFAULT_PERMISSIONS.length} actions`);

    // 3. Panel
    const panel = await prisma.panel.upsert({
        where: { id: "seed-panel-1" },
        update: {},
        create: {
            id: "seed-panel-1",
            guildId: GUILD_ID,
            name: "Support",
            type: PanelType.BUTTON,
            embed: {
                title: "🎫 Support Panel",
                description: "Click a button below to open a ticket.",
                color: 0x5865f2,
            },
        },
    });
    console.log(`  ✔ Panel: ${panel.id} (${panel.name})`);

    // 4. Ticket Panel (button inside the panel)
    const ticketPanel = await prisma.ticketPanel.upsert({
        where: { id: "seed-tp-1" },
        update: {},
        create: {
            id: "seed-tp-1",
            panelId: panel.id,
            name: "General Support",
            description: "Get help with general questions",
            emoji: "🎫",
            style: "PRIMARY",
            channels: {
                categoryId: null,
                logChannelId: null,
            },
        },
    });
    console.log(`  ✔ Ticket Panel: ${ticketPanel.id} (${ticketPanel.name})`);

    // 5. Form (optional, attached to the ticket panel)
    const form = await prisma.formData.upsert({
        where: { id: "seed-form-1" },
        update: {},
        create: {
            id: "seed-form-1",
            name: "Support Form",
            questions: {
                create: [
                    {
                        id: "seed-q-1",
                        name: "What do you need help with?",
                        placeholder: "Describe your issue…",
                        required: true,
                        style: "PARAGRAPH",
                        minLength: 10,
                        maxLength: 1000,
                    },
                ],
            },
        },
    });
    console.log(`  ✔ Form: ${form.id} (${form.name})`);

    // Link form to ticket panel
    await prisma.ticketPanel.update({
        where: { id: ticketPanel.id },
        data: { formId: form.id, hasForm: true },
    });
    console.log(`  ✔ Form linked to Ticket Panel`);

    // 6. Sample ticket (OPEN)
    const ticket = await prisma.ticket.upsert({
        where: { id: "seed-ticket-channel-1" },
        update: {},
        create: {
            id: "seed-ticket-channel-1",
            userId: "123456789012345678", // Fake user ID
            panelId: ticketPanel.id,
            status: TicketStatus.OPEN,
            embed: {
                title: "Ticket #1",
                description: "Test ticket for seeding",
            },
        },
    });
    console.log(`  ✔ Ticket: ${ticket.id} (${ticket.status})`);

    console.log("\n✅ Seed complete!");
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
