import { Request, Response, NextFunction } from "express";
import {
  createInviteSchema,
  acceptInviteParamsSchema,
} from "./invite.validation";
import {
  createInviteService,
  acceptInviteService,
  getWorkspaceInvitesService,
} from "./invite.service";

export const createInviteController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = createInviteSchema.parse(req.body);

    const workspaceId = Array.isArray(req.params.workspaceId)
      ? req.params.workspaceId[0]
      : req.params.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        message: "Workspace ID is required",
      });
    }

    const { invite } = await createInviteService(
      workspaceId,
      email,
      req.user.id
    );

    return res.status(201).json({
      success: true,
      message: "Invite created",
      data: invite,
    });
  } catch (error) {
    next(error);
  }
};

export const acceptInviteController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = acceptInviteParamsSchema.parse(req.params);

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const result = await acceptInviteService(token, req.user.id);
    return res.status(200).json({
      success: true,
      message: "Invite accepted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkspaceInvitesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const workspaceId = Array.isArray(req.params.workspaceId)
      ? req.params.workspaceId[0]
      : req.params.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        message: "Workspace ID is required",
      });
    }

    const invites = await getWorkspaceInvitesService(workspaceId);

    return res.status(200).json({
      success: true,
      data: invites,
    });
  } catch (error) {
    next(error);
  }
};