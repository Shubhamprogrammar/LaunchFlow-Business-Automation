import { Router } from "express";
import { getUploadUrl, saveUploadedFile } from "./upload.controller";
import { requireAuth } from "../../middleware/session.middleware";
import { trackDevice } from "../../middleware/device.middleware";

const router = Router();

router.post("/presign", requireAuth, trackDevice, getUploadUrl);
router.post("/complete", requireAuth, trackDevice, saveUploadedFile);


export default router;