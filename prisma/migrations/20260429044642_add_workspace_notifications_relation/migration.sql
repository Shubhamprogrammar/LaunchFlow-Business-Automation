-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "eventType" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "workspaceId" TEXT;

-- CreateIndex
CREATE INDEX "Notification_workspaceId_idx" ON "Notification"("workspaceId");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
