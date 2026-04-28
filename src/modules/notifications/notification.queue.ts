import { notificationQueue } from "../../queues/notification.queue";

export const pushNotificationJob = async (data: any) => {
  await notificationQueue.add("create-notification", data, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
  });
};