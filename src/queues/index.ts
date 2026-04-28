import { emailQueue } from "./email.queue";

// Export all queues from one place
export const queues = {
  email: emailQueue,
};

// (optional) helper access
export const getQueue = (name: keyof typeof queues) => {
  return queues[name];
};