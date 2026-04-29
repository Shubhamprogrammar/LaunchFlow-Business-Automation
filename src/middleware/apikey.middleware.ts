import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";

export const requireApiKey = async (
  req: any,
  res: any,
  next: any
) => {
  const token = req.headers["x-api-key"];

  if (!token)
    return res.status(401).json({
      message: "Missing API key",
    });

  const prefix = token.split(".")[0];

  const key = await prisma.apiKey.findFirst({
    where: {
      prefix,
      revoked: false,
    },
  });

  if (!key)
    return res.status(401).json({
      message: "Invalid key",
    });

  const valid = await bcrypt.compare(
    token,
    key.keyHash
  );

  if (!valid)
    return res.status(401).json({
      message: "Invalid key",
    });

  await prisma.apiKey.update({
    where: { id: key.id },
    data: {
      lastUsedAt: new Date(),
    },
  });

  req.apiKey = key;

  next();
};
