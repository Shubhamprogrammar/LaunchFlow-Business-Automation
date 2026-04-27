import { Router } from "express";
import { requireAuth } from "../../middleware/session.middleware";
import { getCurrentUserController } from "./user.controller";

const router = Router();

router.get("/me", requireAuth, getCurrentUserController);

export default router;