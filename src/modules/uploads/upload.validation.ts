import { z } from "zod";

export const presignSchema = z.object({
  fileName: z.string().min(1).max(255),
  mimeType: z.string().min(1),
});

export const completeUploadSchema = z.object({
  workspaceId: z.string().min(1),
  fileName: z.string().min(1).max(255),
  fileUrl: z.string().url(),
  size: z.number().int().positive(),
  mimeType: z.string().min(1),
});