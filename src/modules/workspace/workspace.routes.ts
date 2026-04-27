import { Router } from "express";
import { requireAuth } from "../../middleware/session.middleware";
import {
  createWorkspace,
  getMyWorkspaces,
} from "./workspace.controller";

const router = Router();

router.post("/", requireAuth, createWorkspace);
router.get("/", requireAuth, getMyWorkspaces);

export default router;