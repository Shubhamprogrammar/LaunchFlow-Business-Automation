import { Router } from "express";
import { getUserNotifications, markAsRead, markAllAsRead } from "./notification.service";
import {requireAuth} from "../../middleware/session.middleware";

const router = Router();

// GET notifications
router.get("/", requireAuth, async (req, res) => {
  console.log(req.user);
  const userId = req.user.id;
  const notifications = await getUserNotifications(userId);
  res.json(notifications);
});

// MARK ONE AS READ
router.patch("/:id/read", requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  await markAsRead(id, userId);
  res.json({ success: true });
});

// MARK ALL AS READ
router.patch("/read-all", requireAuth, async (req, res) => {
  const userId = req.user.id;

  await markAllAsRead(userId);

  res.json({ success: true });
});

export default router;