export type NotificationJob = {
  userId: string;
  title: string;
  message: string;
  type?: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  workspaceId?: string;
  eventType?: string;
  metadata?: any;
};