import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import routes from "./routes";
import { notFoundHandler } from "./middleware/notfound.middleware";
import { errorHandler } from "./middleware/error.middleware";
import userRoutes from "./modules/user/user.routes";
import workspaceRoutes from "./modules/workspace/workspace.routes";
import inviteRoutes from "./modules/invite/invite.routes";
import memberRoutes from "./modules/member/member.routes";
import billingRoutes from "./modules/billing/billing.routes";
import realtimeRoutes from "./modules/realtime/realtime.routes";
import uploadRoutes from "./modules/uploads/upload.routes";
import apiKeyRoutes from "./modules/apikeys/apikey.routes";
import analyticsRoutes from "./modules/analytics/analytics.routes";
import notificationRoutes from "./modules/notifications/notification.routes";
import auditRoutes from "./modules/audit/audit.routes";
import deviceRoutes from "./modules/device/device.routes";
import { env } from "./config/env";

const app = express();

// Security
app.use(helmet());

// CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', env.FRONTEND_URL].filter(Boolean),
  credentials: true
}));

app.use(
  "/api/billing/webhook",
  express.raw({ type: "application/json" })
);

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logger
app.use(morgan("dev"));

// Health Check
app.get("/health", (_, res) => {
  res.status(200).json({
    success: true,
    message: "Server running 🚀",
  });
});

app.use("/api/auth", toNodeHandler(auth));
// API Routes
app.use("/api/users", userRoutes);
app.use("/api/workspaces", workspaceRoutes);  
app.use("/api/invites", inviteRoutes);
app.use("/api/realtime", realtimeRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/apikeys", apiKeyRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api", memberRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api", routes);

// Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

export default app;