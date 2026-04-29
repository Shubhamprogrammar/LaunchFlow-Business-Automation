import { Request, Response, NextFunction } from "express";
import { createApiKey, listApiKeys, revokeApiKey } from "./apikey.service";
import { prisma } from "../../config/prisma";

export const createApiKeyController = async (
  req: Request,
  res: Response
) => {
  const { workspaceId, name } = req.body;

  const result = await createApiKey(
    req.user.id,
    workspaceId,
    name
  );

  res.json({
    success: true,
    data: result,
  });
};

export const getStatsController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    // attached from requireApiKey middleware
    const apiKey = req.apiKey;

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const workspaceId = apiKey.workspaceId;

    // Fetch workspace stats
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

    return res.status(200).json({
      success: true,
      data: {
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
      },
    });
  } catch (error) {
    next(error);
  }
};

export const listApiKeysController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const rawWorkspaceId = req.params.workspaceId;

    const workspaceId = Array.isArray(rawWorkspaceId)
      ? rawWorkspaceId[0]
      : rawWorkspaceId;

    const keys = await listApiKeys(workspaceId);

    return res.status(200).json({
      success: true,
      data: keys,
    });
  } catch (error) {
    next(error);
  }
};



export const revokeApiKeyController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const keyId = req.params.id;

    await revokeApiKey(
      keyId as string,
      req.body.workspaceId
    );

    return res.status(200).json({
      success: true,
      message: "API key revoked",
    });
  } catch (error) {
    next(error);
  }
};
