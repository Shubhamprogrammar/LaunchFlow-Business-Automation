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

const app = express();

// Security
app.use(helmet());

// CORS
app.use(cors());

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
app.use("/api", memberRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api", routes);

// Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

export default app;