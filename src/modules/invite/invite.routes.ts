import { Router } from "express";
import { requireAuth } from "../../middleware/session.middleware";
import { requireWorkspaceRole } from "../../middleware/requireWorkspaceRole";
import { createInviteController, acceptInviteController } from "./invite.controller";

const router = Router();

router.post(
  "/:workspaceId",
  requireAuth,
  requireWorkspaceRole("OWNER", "ADMIN"),
  createInviteController
);

router.post(
  "/accept/:token",
  requireAuth,
  acceptInviteController
);

export default router;