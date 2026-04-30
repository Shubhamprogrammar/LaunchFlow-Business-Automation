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

export const getWorkspaceStats = async (workspaceId: string) => {
  const [
    membersCount,
    invitesCount,
    notificationsCount,
    filesCount,
    apiKeysCount,
    jobsCount,
    latestActivity,
  ] = await Promise.all([
    prisma.membership.count({
      where: { workspaceId },
    }),

    prisma.invite.count({
      where: { workspaceId },
    }),

    prisma.notification.count({
      where: {
        user: {
          memberships: {
            some: { workspaceId },
          },
        },
      },
    }),

    prisma.fileUpload.count({
      where: { workspaceId },
    }),

    prisma.apiKey.count({
      where: { workspaceId },
    }),

    prisma.job.count({
      where: { workspaceId },
    }),

    prisma.auditLog.findMany({
      where: { workspaceId },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      select: {
        action: true,
        entityType: true,
        createdAt: true,
        metadata: true,
      },
    }),
  ]);

  return {
    workspaceId,

    summary: {
      members: membersCount,
      invites: invitesCount,
      notifications: notificationsCount,
      files: filesCount,
      apiKeys: apiKeysCount,
      jobs: jobsCount,
    },

    latestActivity,
  };
};