import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../config/prisma";
import { env } from "../config/env";
import { handleUserCreated } from "./auth.events";
import { openAPI } from "better-auth/plugins";
import { sendVerificationEmail, sendPasswordResetEmail } from "./mail";

const normalizeURL = (url?: string) => url?.replace(/\/+$/, "");
const vercelURL = env.VERCEL_URL ? `https://${env.VERCEL_URL}` : undefined;
const authBaseURL = normalizeURL(
  env.PUBLIC_AUTH_URL ||
    (env.NODE_ENV === "production" ? env.FRONTEND_URL : env.BETTER_AUTH_URL)
)!;
const useSecureCookies =
  env.NODE_ENV === "production" || authBaseURL.startsWith("https://");
const trustedOrigins = Array.from(
  new Set(
    [
      "http://localhost:3000",
      "http://localhost:3001",
      env.FRONTEND_URL,
      env.BETTER_AUTH_URL,
      env.PUBLIC_AUTH_URL,
      vercelURL,
      ...(env.CORS_ORIGINS?.split(",") ?? []),
    ]
      .map((origin) => normalizeURL(origin?.trim()))
      .filter(Boolean) as string[]
  )
);

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
    useSecureCookies,
    defaultCookieAttributes: {
      sameSite: useSecureCookies ? "none" : "lax",
      secure: useSecureCookies,
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    cookieCache: {
      enabled: true
    }
  },

  baseURL: authBaseURL,
  basePath: "/api/auth",

  trustedOrigins,

  events: {
    emailVerification: {
      verified: async ({ user }: any) => {
        await handleUserCreated(user);
      },
    },
  },
});
