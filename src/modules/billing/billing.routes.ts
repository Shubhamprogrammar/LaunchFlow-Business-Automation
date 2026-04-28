import { Router } from "express";
import express from "express";
import { requireAuth } from "../../middleware/session.middleware";

import {
  createCheckoutSessionController,
  getCurrentPlanController,
  cancelSubscriptionController,
} from "./billing.controller";

import { stripeWebhookController } from "./billing.webhook";

const router = Router();

// Stripe webhook must use raw body
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhookController
);

router.post(
  "/checkout-session",
  requireAuth,
  createCheckoutSessionController
);

router.get(
  "/current-plan/:workspaceId",
  requireAuth,
  getCurrentPlanController
);

router.post(
  "/cancel",
  requireAuth,
  cancelSubscriptionController
);

export default router;