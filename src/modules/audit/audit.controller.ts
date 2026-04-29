import { Request, Response } from "express";
import { prisma } from "../../config/prisma";

export const getWorkspaceActivity = async (
    req: Request,
    res: Response
) => {
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

    const logs = await prisma.auditLog.findMany({
        where: { workspaceId },
        orderBy: { createdAt: "desc" },
        take: 50,
    });

    res.json({
        success: true,
        data: logs,
    });
};