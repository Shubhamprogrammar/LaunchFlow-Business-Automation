import { z } from "zod";

export const workspaceParamsSchema = z.object({
  workspaceId: z.string().min(1),
});

export const membershipParamsSchema = z.object({
  membershipId: z.string().min(1),
});

export const updateRoleSchema = z.object({
  role: z.enum(["ADMIN", "MANAGER", "MEMBER"]),
});