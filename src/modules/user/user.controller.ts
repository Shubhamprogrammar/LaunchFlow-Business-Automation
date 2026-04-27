import { Request, Response } from "express";
import { getCurrentUserService } from "./user.service";

export const getCurrentUserController = async (
  req: Request,
  res: Response
) => {
  const user = await getCurrentUserService(req.user.id);

  return res.status(200).json({
    success: true,
    data: user,
  });
};