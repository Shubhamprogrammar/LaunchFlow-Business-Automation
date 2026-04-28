import { Router } from "express";
import { NotificationService } from "./notification.service";

const router = Router();

// GET notifications
router.get("/", async (req, res) => {
  const userId = req.user.id;

  const notifications =
    await NotificationService.getUserNotifications(userId);

  res.json(notifications);
});

// MARK ONE AS READ
router.patch("/:id/read", async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  await NotificationService.markAsRead(id, userId);

  res.json({ success: true });
});

// MARK ALL AS READ
router.patch("/read-all", async (req, res) => {
  const userId = req.user.id;

  await NotificationService.markAllAsRead(userId);

  res.json({ success: true });
});

export default router;