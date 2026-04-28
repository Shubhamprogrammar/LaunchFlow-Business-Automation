import { Worker } from "bullmq";
import { redis } from "../config/redis";
import { NotificationService } from "../modules/notifications/notification.service";

export const notificationWorker = new Worker(
  "notifications",
  async (job) => {
    const data = job.data;

    await NotificationService.createNotification({
      userId: data.userId,
      title: data.title,
      message: data.message,
      type: data.type,
      workspaceId: data.workspaceId,
      eventType: data.eventType,
      metadata: data.metadata,
    });
  },
  {
    connection: redis,
  }
);