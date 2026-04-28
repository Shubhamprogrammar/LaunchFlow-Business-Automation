import { Request, Response, NextFunction } from "express";
import {
  createCheckoutSchema,
  workspaceParamSchema,
} from "./billing.validation";

import {
  createCheckoutSessionService,
  getCurrentPlanService,
  cancelSubscriptionService,
} from "./billing.service";

export const createCheckoutSessionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { workspaceId, plan } =
      createCheckoutSchema.parse(req.body);

    const session =
      await createCheckoutSessionService(
        workspaceId,
        plan
      );

    return res.status(200).json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentPlanController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { workspaceId } =
      workspaceParamSchema.parse(req.params);

    const data = await getCurrentPlanService(
      workspaceId
    );

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelSubscriptionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { workspaceId } = req.body;

    await cancelSubscriptionService(workspaceId);

    return res.status(200).json({
      success: true,
      message: "Subscription cancelled",
    });
  } catch (error) {
    next(error);
  }
};