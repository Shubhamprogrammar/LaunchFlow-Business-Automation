import { Router } from "express";
import { getUploadUrl, saveUploadedFile } from "./upload.controller";
import { requireAuth } from "../../middleware/session.middleware";

const router = Router();

router.post("/presign", requireAuth, getUploadUrl);
router.post("/complete", requireAuth, saveUploadedFile);

export default router;