import { Worker } from "bullmq";
import { redis } from "../config/redis";
import nodemailer from "nodemailer";
import { env } from "../config/env";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export const emailWorker = new Worker(
  "email-queue",
  async (job) => {
    switch (job.name) {
      case "welcome-email":
        await transporter.sendMail({
          from: "LaunchFlow <no-reply@launchflow.com>",
          to: job.data.email,
          subject: "Welcome to LaunchFlow 🚀",
          text: `Hi ${job.data.name}, welcome aboard!`,
        });
        break;

      case "invite-email":
        await transporter.sendMail({
          from: "LaunchFlow <no-reply@launchflow.com>",
          to: job.data.email,
          subject: "You're invited to join a workspace",
          text: `You were invited to ${job.data.workspaceName}. Join here: ${job.data.inviteLink}`,
        });
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