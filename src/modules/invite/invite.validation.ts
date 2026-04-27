import { z } from "zod";

export const createInviteSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .toLowerCase(),
});

export const acceptInviteParamsSchema = z.object({
  token: z.string().min(10, "Invalid invite token"),
});