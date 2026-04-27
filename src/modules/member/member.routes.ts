// src/modules/member/member.routes.ts
import { Router } from "express";
import { requireAuth } from "../../middleware/session.middleware";
import { requireWorkspaceRole } from "../../middleware/requireWorkspaceRole";

import {
  getWorkspaceMembersController,
  updateMemberRoleController,
  removeMemberController,
} from "./member.controller";

const router = Router();

// List workspace members
router.get(
  "/workspaces/:workspaceId/members",
  requireAuth,
  requireWorkspaceRole("OWNER", "ADMIN", "MANAGER"),
  getWorkspaceMembersController
);

// Update member role
router.patch(
  "/members/:membershipId/role",
  requireAuth,
  updateMemberRoleController
);

// Remove member
router.delete(
  "/members/:membershipId",
  requireAuth,
  removeMemberController
);

export default router;