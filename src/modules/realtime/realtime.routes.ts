import { Router } from "express";
import { subscribeEvents } from "./realtime.controller";
import { requireAuth } from "../../middleware/session.middleware";

const router = Router();

router.get("/stream", requireAuth, subscribeEvents);

export default router;