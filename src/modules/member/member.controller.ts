import { Request, Response, NextFunction } from "express";
import {
  workspaceParamsSchema,
  membershipParamsSchema,
  updateRoleSchema,
} from "./member.validation";

import {
  getWorkspaceMembersService,
  updateMemberRoleService,
  removeMemberService,
} from "./member.service";

export const getWorkspaceMembersController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { workspaceId } = workspaceParamsSchema.parse(req.params);

    const members = await getWorkspaceMembersService(workspaceId);

    return res.status(200).json({
      success: true,
      data: members,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMemberRoleController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { membershipId } = membershipParamsSchema.parse(req.params);
    const { role } = updateRoleSchema.parse(req.body);

    const member = await updateMemberRoleService(
      membershipId,
      role
    );

    return res.status(200).json({
      success: true,
      message: "Role updated successfully",
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

export const removeMemberController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { membershipId } = membershipParamsSchema.parse(req.params);

    await removeMemberService(membershipId, (req as any).user.id);

    return res.status(200).json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error) {
    next(error);
  }
};