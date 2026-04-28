import { Queue } from "bullmq";
import { redis } from "../config/redis";

export const notificationQueue = new Queue("notifications", {
  connection: redis,
});