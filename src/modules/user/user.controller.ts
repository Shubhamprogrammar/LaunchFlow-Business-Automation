import { Request, Response } from "express";

export const getMe = async (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
};