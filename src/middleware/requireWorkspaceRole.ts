import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";

export const requireWorkspaceRole =
  (...allowedRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rawWorkspaceId = req.params.workspaceId;

      const workspaceId = Array.isArray(rawWorkspaceId)
        ? rawWorkspaceId[0]
        : rawWorkspaceId;

      if (!workspaceId) {
        return res.status(400).json({
          success: false,
          message: "Workspace ID is required",
        });
      }

      const membership = await prisma.membership.findFirst({
        where: {
          workspaceId,
          userId: req.user.id,
        },
      });

      if (!membership) {
        return res.status(403).json({
          success: false,
          message: "Not a workspace member",
        });
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(membership.role)) {
        return res.status(403).json({
          success: false,
          message: "Insufficient permissions",
        });
      }

      req.membership = membership;

      next();
    } catch (error) {
      next(error);
    }
  };