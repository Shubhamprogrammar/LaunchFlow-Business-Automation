import { Request, Response, NextFunction } from "express";
import { createInviteSchema, acceptInviteParamsSchema } from "./invite.validation";
import { createInviteService, acceptInviteService } from "./invite.service";

export const createInviteController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = createInviteSchema.parse(req.body);

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

    const invite = await createInviteService(
      workspaceId,
      email,
      req.body.workspaceName,
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

    const result = await acceptInviteService(
      token,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: "Invite accepted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};