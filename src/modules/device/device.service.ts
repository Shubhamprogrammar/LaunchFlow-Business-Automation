import { prisma } from "../../config/prisma";

type UpsertDeviceInput = {
  userId: string;
  deviceName: string;
  browser?: string;
  os?: string;
  ipAddress?: string;
};

export const upsertDevice = async ({
  userId,
  deviceName,
  browser,
  os,
  ipAddress,
}: UpsertDeviceInput) => {
  const existing = await prisma.device.findFirst({
    where: {
      userId,
      browser,
      os,
      ipAddress,
    },
  });

  if (existing) {
    return prisma.device.update({
      where: { id: existing.id },
      data: {
        lastUsedAt: new Date(),
      },
    });
  }

  return prisma.device.create({
    data: {
      userId,
      deviceName,
      browser,
      os,
      ipAddress,
      lastUsedAt: new Date(),
    },
  });
};