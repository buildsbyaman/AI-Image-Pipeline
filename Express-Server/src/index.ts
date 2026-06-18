import { createServer } from "http";
import app from "./app";
import { env } from "./config/env";
import { connectToDatabase, disconnectFromDatabase } from "@imagepipeline/db";
import { logger } from "./shared/utils/logger";
import { redisSubscriber } from "./modules/notification/notification.subscriber";
import { pipelineEventsWorker } from "./modules/job/pipeline.worker";

const startServer = async () => {
  try {
    await connectToDatabase(env.DATABASE_URL);
    logger.info("✅ Database connection established.");

    const httpServer = createServer(app);

    // Initialize Redis Pub/Sub Listener
    redisSubscriber.init();

    logger.info("✅ Pipeline events worker initialized.");

    httpServer.listen(env.PORT, () => {
      logger.info(`☑️ Server is running on port ${env.PORT} in ${env.NODE_ENV} mode.`);
    });
  } catch (error) {
    logger.error("❌ Failed to start server:", error);
    await disconnectFromDatabase();
    process.exit(1);
  }
};

startServer();

process.on("SIGINT", async () => {
  logger.info("Shutting down gracefully...");
  await disconnectFromDatabase();
  process.exit(0);
});
