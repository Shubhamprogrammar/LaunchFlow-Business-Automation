import { Router } from "express";
import {
  getDevicesController,
  revokeDeviceController,
} from "./device.controller";
import { requireAuth } from "../../middleware/session.middleware";

const router = Router();

router.get("/", requireAuth, getDevicesController);
router.delete("/:deviceId", requireAuth, revokeDeviceController);

export default router;