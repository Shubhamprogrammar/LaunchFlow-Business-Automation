import nodemailer from "nodemailer";
import { env } from "../config/env";
import { addVerificationEmailJob, addPasswordResetEmailJob } from "../jobs/email.jobs";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

/**
 * Public function to queue verification email
 */
export const sendVerificationEmail = async (data: {
  email: string;
  url: string;
  token: string;
}) => {
  await addVerificationEmailJob(data);
};

/**
 * Public function to queue password reset email
 */
export const sendPasswordResetEmail = async (data: {
  email: string;
  url: string;
}) => {
  await addPasswordResetEmailJob(data);
};

/**
 * Internal function to actually send verification email (used by worker)
 */
export const executeSendVerificationEmail = async ({
  email,
  url,
  token,
}: {
  email: string;
  url: string;
  token: string;
}) => {
  const mailOptions = {
    from: "LaunchFlow <no-reply@launchflow.com>",
    to: email,
    subject: "Verify your email address",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
        <h2 style="color: #4f46e5; text-align: center;">Welcome to LaunchFlow!</h2>
        <p>Please verify your email address to complete your registration and access your dashboard.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${url}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email Address</a>
        </div>
        <p style="font-size: 12px; color: #666;">If you didn't create an account with LaunchFlow, you can safely ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 10px; color: #999; text-align: center;">© 2026 LaunchFlow Platform</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email}`);
  } catch (error) {
    console.error("❌ Failed to send verification email:", error);
    if (env.NODE_ENV === "development") {
      console.log("DEV: Verification URL:", url);
    }
    throw error; // Rethrow so the worker knows it failed
  }
};

/**
 * Internal function to actually send password reset email (used by worker)
 */
export const executeSendPasswordResetEmail = async ({
  email,
  url,
}: {
  email: string;
  url: string;
}) => {
  const mailOptions = {
    from: "LaunchFlow <no-reply@launchflow.com>",
    to: email,
    subject: "Reset your password",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
        <h2 style="color: #4f46e5; text-align: center;">Password Reset</h2>
        <p>We received a request to reset your password. Click the button below to choose a new one.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${url}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </div>
        <p style="font-size: 12px; color: #666;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
        <p style="font-size: 12px; color: #666;">This link will expire in 1 hour.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 10px; color: #999; text-align: center;">© 2026 LaunchFlow Platform</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${email}`);
  } catch (error) {
    console.error("❌ Failed to send password reset email:", error);
    if (env.NODE_ENV === "development") {
      console.log("DEV: Password Reset URL:", url);
    }
    throw error; // Rethrow so the worker knows it failed
  }
};

/**
 * Internal function to actually send welcome email (used by worker)
 */
export const executeSendWelcomeEmail = async ({
  email,
  name,
}: {
  email: string;
  name: string;
}) => {
  const mailOptions = {
    from: "LaunchFlow <no-reply@launchflow.com>",
    to: email,
    subject: "Welcome to LaunchFlow 🚀",
    text: `Hi ${name}, welcome aboard!`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${email}`);
  } catch (error) {
    console.error("❌ Failed to send welcome email:", error);
    throw error;
  }
};

/**
 * Internal function to actually send invite email (used by worker)
 */
export const executeSendInviteEmail = async ({
  email,
  workspaceName,
  inviteLink,
}: {
  email: string;
  workspaceName: string;
  inviteLink: string;
}) => {
  const mailOptions = {
    from: "LaunchFlow <no-reply@launchflow.com>",
    to: email,
    subject: "You're invited to join a workspace",
    text: `You were invited to ${workspaceName}. Join here: ${inviteLink}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Invite email sent to ${email}`);
  } catch (error) {
    console.error("❌ Failed to send invite email:", error);
    throw error;
  }
};
