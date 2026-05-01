import { Router } from "express";
import { requireAuth } from "../../middleware/session.middleware";
import {
  createWorkspace,
  getMyWorkspaces,
} from "./workspace.controller";
import { trackDevice } from "../../middleware/device.middleware";

const router = Router();

router.post("/create-workspace", requireAuth, trackDevice, createWorkspace);
router.get("/my-workspaces", requireAuth, trackDevice, getMyWorkspaces);

export default router;