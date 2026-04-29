import { Router } from "express";
import { getWorkspaceActivity } from "./audit.controller";

const router = Router();

router.get("/:workspaceId/activity", getWorkspaceActivity);

export default router;