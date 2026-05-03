import { Router } from "express";
import { getUploadUrl, saveUploadedFile, listWorkspaceFiles, deleteFileController } from "./upload.controller";
import { requireAuth } from "../../middleware/session.middleware";
import { trackDevice } from "../../middleware/device.middleware";

const router = Router();

router.post("/presign", requireAuth, trackDevice, getUploadUrl);
router.post("/complete", requireAuth, trackDevice, saveUploadedFile);
router.get("/workspace/:workspaceId", requireAuth, trackDevice, listWorkspaceFiles);
router.delete("/:fileId", requireAuth, trackDevice, deleteFileController);

export default router;