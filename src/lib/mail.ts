import nodemailer from "nodemailer";
import { env } from "../config/env";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export const sendVerificationEmail = async ({
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
  }
};

export const sendPasswordResetEmail = async ({
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
  }
};
