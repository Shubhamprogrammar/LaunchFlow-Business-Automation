// src/modules/member/member.routes.ts
import { Router } from "express";
import { requireAuth } from "../../middleware/session.middleware";
import { requireWorkspaceRole } from "../../middleware/requireWorkspaceRole";

import {
  getWorkspaceMembersController,
  updateMemberRoleController,
  removeMemberController,
} from "./member.controller";
import { trackDevice } from "../../middleware/device.middleware";

const router = Router();

// List workspace members
router.get(
  "/workspaces/:workspaceId/members",
  requireAuth,
  trackDevice,
  requireWorkspaceRole("OWNER", "ADMIN", "MANAGER"),
  getWorkspaceMembersController
);

// Update member role
router.patch(
  "/members/:membershipId/role",
  requireAuth,
  trackDevice,
  updateMemberRoleController
);

// Remove member
router.delete(
  "/members/:membershipId",
  requireAuth,
  trackDevice,
  removeMemberController
);

export default router;