import { Request, Response, NextFunction } from "express";
import {
  createInviteSchema,
  acceptInviteParamsSchema,
} from "./invite.validation";
import {
  createInviteService,
  acceptInviteService,
} from "./invite.service";
import { eventBus } from "../events/event.bus";
import { EventTypes } from "../events/event.types";

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
      req.user.id
    );

    eventBus.emit(EventTypes.INVITE_CREATED, event);

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

    eventBus.emit(EventTypes.INVITE_ACCEPTED, result);

    eventBus.emit("WORKSPACE_JOINED", {
      userId: req.user.id,
      workspaceId: result.workspaceId,
      workspaceName: result.workspace.name,
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