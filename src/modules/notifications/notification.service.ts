import { prisma } from "../../config/prisma";

export class NotificationService {
  static async createNotification(input: {
    userId: string;
    title: string;
    message: string;
    type?: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
    workspaceId?: string;
    eventType?: string;
    metadata?: any;
  }) {
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
  }

  static async getUserNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async markAsRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });
  }

  static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId },
      data: { read: true },
    });
  }
}