import { pushNotificationJob } from "./notification.queue";

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
};