import { Router } from "express";
import { requireAuth } from "../../middleware/session.middleware";
import { getWorkspaceAnalytics } from "./analytics.controller";

const router = Router();

router.get(
  "/workspace/:workspaceId",
  requireAuth,
  getWorkspaceAnalytics
);

export default router;