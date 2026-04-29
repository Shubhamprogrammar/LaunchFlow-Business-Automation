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