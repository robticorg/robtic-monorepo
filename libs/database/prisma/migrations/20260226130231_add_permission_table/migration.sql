-- DropForeignKey
ALTER TABLE "ButtonData" DROP CONSTRAINT "ButtonData_ticketPanelId_fkey";

-- DropForeignKey
ALTER TABLE "Panel" DROP CONSTRAINT "Panel_guildId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_formId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_panelId_fkey";

-- DropForeignKey
ALTER TABLE "TicketPanel" DROP CONSTRAINT "TicketPanel_panelId_fkey";

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "permissions" TEXT[],
    "roleIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Permission_guildId_idx" ON "Permission"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_guildId_action_key" ON "Permission"("guildId", "action");

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Panel" ADD CONSTRAINT "Panel_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketPanel" ADD CONSTRAINT "TicketPanel_panelId_fkey" FOREIGN KEY ("panelId") REFERENCES "Panel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_panelId_fkey" FOREIGN KEY ("panelId") REFERENCES "TicketPanel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_formId_fkey" FOREIGN KEY ("formId") REFERENCES "FormData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ButtonData" ADD CONSTRAINT "ButtonData_ticketPanelId_fkey" FOREIGN KEY ("ticketPanelId") REFERENCES "TicketPanel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
