import {
  ImageCaptioningWorker,
  LabelDetectionWorker,
  SafetyCheckWorker,
  startCacheSweeper,
} from "./modules/job/job.worker";
import { logger } from "./shared/logger";

// Bootstraps the microservice, starting workers and the background disk sweeper
const startWorker = async () => {
  logger.info("AI Processing Worker Microservice started and waiting for jobs...");

  // Runs background sweeper to clear stale temp files in case of system crashes
  startCacheSweeper();

  // Initialize all three BullMQ workers for captioning, labels, and safety screenings
  const w1 = new ImageCaptioningWorker();
  const w2 = new LabelDetectionWorker();
  const w3 = new SafetyCheckWorker();

  // Graceful shutdown handler to release queue listener resources and close Redis connections cleanly
  const gracefulShutdown = async (signal: string) => {
    logger.info(`Received ${signal}, closing workers gracefully...`);
    await Promise.all([w1.close(), w2.close(), w3.close()]);
    process.exit(0);
  };

  // Wire standard OS termination signals for clean container shut-downs
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
};

startWorker();
