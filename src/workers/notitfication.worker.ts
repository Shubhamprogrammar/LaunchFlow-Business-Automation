import { Worker } from "bullmq";
import { redis } from "../config/redis";
import { createNotification } from "../modules/notifications/notification.service";

export const notificationWorker = new Worker(
  "notifications",
  async (job) => {
    const data = job.data;
    console.log(data);
    await createNotification({
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