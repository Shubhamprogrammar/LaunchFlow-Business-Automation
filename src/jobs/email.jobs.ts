import { emailQueue } from "../queues/email.queue";

export const addWelcomeEmailJob = async (data: {
  email: string;
  name: string;
}) => {
  await emailQueue.add("welcome-email", data, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
  });
};

export const addInviteEmailJob = async (data: {
  email: string;
  workspaceName: string;
  inviteLink: string;
}) => {
  await emailQueue.add("invite-email", data, {
    attempts: 3,
    delay: 1000,
  });
};