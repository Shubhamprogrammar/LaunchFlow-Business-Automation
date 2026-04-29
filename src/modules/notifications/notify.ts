import { pushNotificationJob } from "./notification.queue";
import { prisma } from "../../config/prisma";
import { sendToUser } from "../realtime/realtime.store";

export const notifyUser = async (input: {
  userId: string;
  title: string;
  message: string;
  type?: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  workspaceId?: string;
  eventType?: string;
  metadata?: any;
}) => {
  await pushNotificationJob(input);
  const notification = await prisma.notification.create({
    data: {
      userId: input.userId,
      title: input.title,
      message: input.message,
      type: input.type,
    },
  });

  sendToUser(input.userId, "notification", notification);

  return notification;
};