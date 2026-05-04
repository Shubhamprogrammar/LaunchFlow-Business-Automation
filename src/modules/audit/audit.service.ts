import { prisma } from "../../config/prisma";

export const createAuditLog = async (data: {
  workspaceId: string;
  actorId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: any;
}) => {
  return prisma.auditLog.create({
    data,
  });
};

export const getWorkspaceActivityService = async (
  workspaceId: string
) => {
  const logs = await prisma.auditLog.findMany({
    where: {
      workspaceId,
    },
    include: {
      actor: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50
  });

  return logs;
};