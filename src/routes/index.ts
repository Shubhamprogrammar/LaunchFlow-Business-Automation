import { Router } from "express";
import { requireAuth } from "../middleware/session.middleware";

const router = Router();

router.get("/", (_, res) => {
  res.json({
    success: true,
    message: "Launchflow API Running",
  });
});

router.get("/me", requireAuth, (req: any, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

export default router;