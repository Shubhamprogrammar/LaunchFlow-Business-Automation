import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  PORT: z.coerce.number().default(5000),

  DATABASE_URL: z.string().min(1),

  BETTER_AUTH_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(16),

  FRONTEND_URL: z.string().url(),

  REDIS_URL: z.string().min(1),

  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),

  STRIPE_PRICE_PRO: z.string().min(1),
  STRIPE_PRICE_TEAM: z.string().min(1),
  STRIPE_PRICE_ENTERPRISE: z.string().min(1),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  MAIL_FROM: z.string().optional(),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),

  AWS_REGION: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_BUCKET_NAME: z.string().optional(),

  MAILJET_API_KEY: z.string().optional(),
  MAILJET_API_SECRET: z.string().optional(),
  MAILJET_API: z.string().optional(),
  MAILJET_SECRET: z.string().optional(),
  LOG_LEVEL: z.string().default("info"),
});

const parsedEnv = envSchema.parse(process.env);

export const env = {
  ...parsedEnv,
  MAILJET_API_KEY: parsedEnv.MAILJET_API_KEY || parsedEnv.MAILJET_API,
  MAILJET_API_SECRET: parsedEnv.MAILJET_API_SECRET || parsedEnv.MAILJET_SECRET,
};
