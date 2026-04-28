import { z } from "zod";

export const createCheckoutSchema = z.object({
  workspaceId: z.string().min(1),
  plan: z.enum(["PRO", "TEAM", "ENTERPRISE"]),
});

export const workspaceParamSchema = z.object({
  workspaceId: z.string().min(1),
});