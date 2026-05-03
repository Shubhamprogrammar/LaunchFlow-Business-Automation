import { Router } from "express";
import { requireAuth } from "../../middleware/session.middleware";
import { requireWorkspaceRole } from "../../middleware/requireWorkspaceRole";
import { createInviteController, acceptInviteController, getWorkspaceInvitesController } from "./invite.controller";
import { trackDevice } from "../../middleware/device.middleware";

const router = Router();

router.post(
  "/:workspaceId",
  requireAuth,
  trackDevice,
  requireWorkspaceRole("OWNER", "ADMIN"),
  createInviteController
);

router.post(
  "/accept/:token",
  requireAuth,
  trackDevice,
  acceptInviteController
);

router.get(
  "/:workspaceId",
  requireAuth,
  trackDevice,
  getWorkspaceInvitesController
);

export default router;