import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import routes from "./routes";
import { notFoundHandler } from "./middleware/notfound.middleware";
import { errorHandler } from "./middleware/error.middleware";

const app = express();

// Security
app.use(helmet());

// CORS
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
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

// API Routes
app.use("/api", routes);

// Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

export default app;