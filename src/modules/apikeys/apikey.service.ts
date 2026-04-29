import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../../config/prisma";

export const createApiKey = async (
  userId: string,
  workspaceId: string,
  name: string
) => {
  const secret = crypto
    .randomBytes(32)
    .toString("hex");

  const prefix =
    "lf_live_" +
    crypto.randomBytes(4).toString("hex");

  const rawKey = `${prefix}.${secret}`;

  const keyHash = await bcrypt.hash(rawKey, 10);

  const key = await prisma.apiKey.create({
    data: {
      userId,
      workspaceId,
      name,
      keyHash,
      prefix,
    },
  });

  return {
    id: key.id,
    name: key.name,
    apiKey: rawKey, // reveal once
  };
};



// list keys

export const listApiKeys = async (
  workspaceId: string
) => {
  return prisma.apiKey.findMany({
    where: {
      workspaceId,
      revoked: false,
    },
    select: {
      id: true,
      name: true,
      prefix: true,
      lastUsedAt: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};



// revoke

export const revokeApiKey = async (
  keyId: string,
  workspaceId: string
) => {
  return prisma.apiKey.update({
    where: { id: keyId },
    data: {
      revoked: true,
    },
  });
};
