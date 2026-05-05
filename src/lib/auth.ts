import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../config/prisma";
import { env } from "../config/env";
import { handleUserCreated } from "./auth.events";
import { openAPI } from "better-auth/plugins";
import { sendVerificationEmail, sendPasswordResetEmail } from "./mail";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    async sendResetPassword({ user, url, token }, request) {
      await sendPasswordResetEmail({
        email: user.email,
        url,
      });
    },
  },

  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID || "",
      clientSecret: env.GOOGLE_CLIENT_SECRET || "",
    },
    github: {
      clientId: env.GITHUB_CLIENT_ID || "",
      clientSecret: env.GITHUB_CLIENT_SECRET || "",
    },
  },

  emailVerification: {
    autoSignInAfterVerification: true,
    async sendVerificationEmail({ user, url, token }, request) {
      await sendVerificationEmail({
        email: user.email,
        url,
        token,
      });
    },
  },

  plugins: [
    openAPI(),
  ],

  advanced: {
    useSecureCookies: true,
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    cookieCache: {
      enabled: true
    }
  },

  baseURL: env.BETTER_AUTH_URL.replace(/\/+$/, ""),
  basePath: "/api/auth",

  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    env.FRONTEND_URL
  ],

  events: {
    emailVerification: {
      verified: async ({ user }: any) => {
        await handleUserCreated(user);
      },
    },
  },
});