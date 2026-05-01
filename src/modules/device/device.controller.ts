import { Request, Response } from "express";
import { prisma } from "../../config/prisma";

// Get all devices of logged-in user
export const getDevicesController = async (req: any, res: Response) => {
  const devices = await prisma.device.findMany({
    where: { userId: req.user.id },
    orderBy: { lastUsedAt: "desc" },
  });

  res.json({
    success: true,
    data: devices,
  });
};

// Delete a device (logout from that device)
export const revokeDeviceController = async (req: any, res: Response) => {
  const { deviceId } = req.params;

  const device = await prisma.device.findUnique({
    where: { id: deviceId },
  });

  if (!device || device.userId !== req.user.id) {
    return res.status(404).json({
      success: false,
      message: "Device not found",
    });
  }

  await prisma.device.delete({
    where: { id: deviceId },
  });

  res.json({
    success: true,
    message: "Device removed successfully",
  });
};