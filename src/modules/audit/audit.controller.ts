import { Request, Response } from "express";
import { getWorkspaceActivityService } from "./audit.service";

export const getWorkspaceActivity = async (
  req: Request,
  res: Response
) => {
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

    const logs = await getWorkspaceActivityService(workspaceId);

    return res.status(200).json({
      success: true,
      message: "Workspace activity fetched successfully",
      data: logs,
    });
  } catch (error) {
    console.error("Get Workspace Activity Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};