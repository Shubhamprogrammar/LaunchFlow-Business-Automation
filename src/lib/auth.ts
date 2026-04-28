import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../config/prisma";
import { env } from "../config/env";
import { handleUserCreated } from "./auth.events"

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    cookieCache: {
    enabled: true
  } 
  },

  trustedOrigins: [
    env.FRONTEND_URL
  ],
  callbacks: {
    onUserCreated: async (user:any) => {
      await handleUserCreated(user);
    },
  },
});