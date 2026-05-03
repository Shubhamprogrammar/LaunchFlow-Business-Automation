import { Router } from "express";
import { getUserNotifications, markAsRead, markAllAsRead } from "./notification.service";
import {requireAuth} from "../../middleware/session.middleware";

const router = Router();

// GET notifications
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const notifications = await getUserNotifications(userId);
    res.json(notifications);
  } catch (error) {
    next(error);
  }
});

// MARK ONE AS READ
router.patch("/:id/read", requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    await markAsRead(id, userId);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// MARK ALL AS READ
router.patch("/read-all", requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    await markAllAsRead(userId);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;