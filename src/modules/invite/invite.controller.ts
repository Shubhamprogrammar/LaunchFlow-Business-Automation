import { Request, Response, NextFunction } from "express";
import {
  createInviteSchema,
  acceptInviteParamsSchema,
} from "./invite.validation";

import {
  createInviteService,
  acceptInviteService,
} from "./invite.service";

import { notifyUser } from "../../modules/notifications/notify";

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

    const { invite, event } = await createInviteService(
      workspaceId,
      email,
      req.body.workspaceName,
      req.user.id
    );

    // 🔔 NOTIFICATION (Invite created)
    await notifyUser({
      userId: event.userId,
      title: "Invite Sent",
      message: `You invited ${event.email} to ${event.workspaceName}`,
      type: "SUCCESS",
      workspaceId: event.workspaceId,
      eventType: event.type,
    });

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

    const result = await acceptInviteService(token, req.user.id);

    // 🔔 NOTIFICATIONS

    // 1. Notify inviter
    await notifyUser({
      userId: result.invitedById,
      title: "Invite Accepted",
      message: `${result.userEmail} joined your workspace`,
      type: "SUCCESS",
      workspaceId: result.workspaceId,
      eventType: "INVITE_ACCEPTED",
    });

    // 2. Notify new member
    await notifyUser({
      userId: req.user.id,
      title: "Welcome!",
      message: `You joined ${result.workspace.name}`,
      type: "SUCCESS",
      workspaceId: result.workspaceId,
      eventType: "WORKSPACE_JOINED",
    });

    return res.status(200).json({
      success: true,
      message: "Invite accepted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};