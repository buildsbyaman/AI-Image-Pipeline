import { createServer } from "http";
import app from "./app";
import { env } from "./config";
import { connectToDatabase, disconnectFromDatabase } from "./database";
import { logger } from "./shared/logger";
import { redisSubscriber } from "./features/realtime/redis.subscriber";
import { pipelineEventsWorker } from "./features/jobs/pipeline.worker";
import { initializeSocketGateway } from "./features/realtime/socket.gateway";

const startServer = async () => {
  try {
    await connectToDatabase(env.DATABASE_URL);
    logger.info("✅ Database connection established.");

    const httpServer = createServer(app);

    // Initialize Socket Gateway
    initializeSocketGateway(httpServer);

    // Initialize Redis Pub/Sub Listener
    redisSubscriber.init();

    logger.info("✅ Pipeline events worker initialized.");

    // Initialize Pipeline events worker listener
    // (Importing the file registers/starts the worker automatically via BullMQ)
    const workerName = pipelineEventsWorker.name;
    logger.info(`✅ BullMQ Worker [${workerName}] running.`);

    httpServer.listen(env.PORT, () => {
      logger.info(`☑️ Server is running on port ${env.PORT} in ${env.NODE_ENV} mode.`);
    });
  } catch (error) {
    logger.error(error as Error, "❌ Failed to start server:");
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

process.on("SIGTERM", async () => {
  logger.info("Shutting down gracefully...");
  await disconnectFromDatabase();
  process.exit(0);
});

