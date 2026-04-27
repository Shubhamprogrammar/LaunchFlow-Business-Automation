import { Router } from "express";
import { getMe } from "./user.controller";
import { requireAuth } from "../../middleware/session.middleware";

const router = Router();

router.get("/me", requireAuth, getMe);

export default router;