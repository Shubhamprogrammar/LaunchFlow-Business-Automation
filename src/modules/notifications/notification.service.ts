import { prisma } from "../../config/prisma";

type CreateNotificationInput = {
  userId: string;
  title: string;
  message: string;
  type?: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  workspaceId?: string;
  eventType?: string;
  metadata?: any;
};

export const createNotification = async (
  input: CreateNotificationInput
) => {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      title: input.title,
      message: input.message,
      type: input.type ?? "INFO",
      workspaceId: input.workspaceId,
      eventType: input.eventType,
      metadata: input.metadata,
    },
  });
};

export const getUserNotifications = async (userId: string) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

export const markAsRead = async (
  id: string,
  userId: string
) => {
  return prisma.notification.updateMany({
    where: { id, userId },
    data: { read: true },
  });
};

export const markAllAsRead = async (userId: string) => {
  return prisma.notification.updateMany({
    where: { userId },
    data: { read: true },
  });
};