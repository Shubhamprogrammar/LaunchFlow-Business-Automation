import { Request, Response } from "express";
import { getCurrentUserService, updateProfileService } from "./user.service";

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

export const updateProfileController = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, image } = req.body;
    
    const user = await updateProfileService(req.user.id, { name, image });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update profile", });
  }
};