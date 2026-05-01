import { Request, Response, NextFunction } from "express";
import {UAParser} from "ua-parser-js";
import { upsertDevice } from "../modules/device/device.service";

export const trackDevice = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) return next();

    const userAgent = req.headers["user-agent"] || "";
    const parser = new UAParser(userAgent);

    const deviceName = parser.getDevice().model || "Unknown Device";
    const browser = parser.getBrowser().name;
    const os = parser.getOS().name;

    const ip =
      req.ip ||
      req.headers["x-forwarded-for"] ||
      req.socket?.remoteAddress;

    await upsertDevice({
      userId: req.user.id,
      deviceName,
      browser,
      os,
      ipAddress: ip as string,
    });

    next();
  } catch (error) {
    next(); // don't break request if device fails
  }
};