import { Worker } from "bullmq";
import { redis } from "../config/redis";
import { 
  executeSendVerificationEmail, 
  executeSendPasswordResetEmail,
  executeSendWelcomeEmail,
  executeSendInviteEmail
} from "../lib/mail";

export const emailWorker = new Worker(
  "email-queue",
  async (job) => {
    switch (job.name) {
      case "welcome-email":
        await executeSendWelcomeEmail(job.data);
        break;

      case "invite-email":
        await executeSendInviteEmail(job.data);
        break;

      case "verification-email":
        await executeSendVerificationEmail(job.data);
        break;

      case "password-reset-email":
        await executeSendPasswordResetEmail(job.data);
        break;
    }
  },
  {
    connection: redis,
  }
);

emailWorker.on("completed", (job) => {
  console.log(`✅ Job completed: ${job.name}`);
});

emailWorker.on("failed", (job, err) => {
  console.log(`❌ Job failed: ${job?.name}`, err);
});