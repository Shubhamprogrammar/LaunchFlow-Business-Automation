import { Router } from "express";
import { requireAuth } from "../../middleware/session.middleware";
import { getCurrentUserController } from "./user.controller";
import { trackDevice } from "../../middleware/device.middleware";

const router = Router();

router.get("/me", requireAuth, trackDevice, getCurrentUserController);

export default router;