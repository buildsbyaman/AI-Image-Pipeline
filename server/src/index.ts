import app from "./app";
import { env } from "./config/env";
import { prisma } from "./utils/prisma";
import { logger } from "./utils/logger";

const startServer = async () => {
  try {
    await prisma.$connect();
    logger.info("✅ Database connection established.");

    app.listen(env.PORT, () => {
      logger.info(`☑️ Server is running on port ${env.PORT} in ${env.NODE_ENV} mode.`);
    });
  } catch (error) {
    logger.error("❌ Failed to start server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

startServer();

process.on("SIGINT", async () => {
  logger.info("Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});
