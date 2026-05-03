import { Request, Response, NextFunction } from "express";
import { createApiKey, listApiKeys, revokeApiKey, getWorkspaceStats } from "./apikey.service";

export const createApiKeyController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { workspaceId, name } = req.body;

    const result = await createApiKey( req.user.id, workspaceId, name );

    res.json({ success: true, data: result, });
  } catch (error) {
    next(error);
  }
};

export const getStatsController = async (req: any, res: Response, next: NextFunction) => {
  try {
    const apiKey = req.apiKey;

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const workspaceId = apiKey.workspaceId;

    const data = await getWorkspaceStats(workspaceId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const listApiKeysController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const rawWorkspaceId = req.params.workspaceId;

    const workspaceId = Array.isArray(rawWorkspaceId)
      ? rawWorkspaceId[0]
      : rawWorkspaceId;

    const keys = await listApiKeys(workspaceId);

    return res.status(200).json({
      success: true,
      data: keys,
    });
  } catch (error) {
    next(error);
  }
};



export const revokeApiKeyController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const keyId = req.params.id;

    await revokeApiKey( keyId as string, req.body.workspaceId );

    return res.status(200).json({
      success: true,
      message: "API key revoked",
    });
  } catch (error) {
    next(error);
  }
};
