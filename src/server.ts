import app from "./app";
import { prisma } from "./config/prisma";
import { env } from "./config/env";
import "./workers/email.worker";
const PORT = env.PORT || 5000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log("✅ Database Connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server", error);
    process.exit(1);
  }
}

startServer();