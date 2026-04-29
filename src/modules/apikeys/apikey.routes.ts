import { Router } from "express";
import { createApiKeyController, getStatsController, listApiKeysController, revokeApiKeyController, } from "./apikey.controller";
import { requireAuth } from "../../middleware/session.middleware";
import { requireApiKey } from "../../middleware/apikey.middleware";

const router = Router();

router.post("/", requireAuth, createApiKeyController);

router.get("/stats", requireApiKey, getStatsController);
router.get(
  "/workspace/:workspaceId",
  requireAuth,
  listApiKeysController
);

router.delete(
  "/:id",
  requireAuth,
  revokeApiKeyController
);

export default router;
