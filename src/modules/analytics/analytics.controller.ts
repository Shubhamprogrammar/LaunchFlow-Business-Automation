import { Request, Response, NextFunction } from "express";
import { prisma } from "../../config/prisma";

export const getWorkspaceAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const rawWorkspaceId = req.params.workspaceId;

    const workspaceId = Array.isArray(rawWorkspaceId)
      ? rawWorkspaceId[0]
      : rawWorkspaceId;

    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        message: "Workspace ID required",
      });
    }

    const [
      totalMembers,
      totalInvites,
      pendingInvites,
      acceptedInvites,
      totalFiles,
      totalApiKeys,
      totalJobs,
      latestUsers,
    ] = await Promise.all([
      prisma.membership.count({
        where: { workspaceId },
      }),

      prisma.invite.count({
        where: { workspaceId },
      }),

      prisma.invite.count({
        where: {
          workspaceId,
          status: "PENDING",
        },
      }),

      prisma.invite.count({
        where: {
          workspaceId,
          status: "ACCEPTED",
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

      prisma.membership.findMany({
        where: { workspaceId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      }),
    ]);

    const inviteConversion =
      totalInvites === 0
        ? 0
        : Math.round(
            (acceptedInvites / totalInvites) * 100
          );

    return res.status(200).json({
      success: true,
      data: {
        overview: {
          members: totalMembers,
          invites: totalInvites,
          pendingInvites,
          acceptedInvites,
          inviteConversion,
          files: totalFiles,
          apiKeys: totalApiKeys,
          jobs: totalJobs,
        },
        latestUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};