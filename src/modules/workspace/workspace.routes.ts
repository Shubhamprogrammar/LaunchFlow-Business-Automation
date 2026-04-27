import { Router } from "express";
import { requireAuth } from "../../middleware/session.middleware";
import {
  createWorkspace,
  getMyWorkspaces,
} from "./workspace.controller";

const router = Router();

router.post("/create-workspace", requireAuth, createWorkspace);
router.get("/my-workspaces", requireAuth, getMyWorkspaces);

export default router;