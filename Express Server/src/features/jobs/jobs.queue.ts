import { Queue } from "bullmq";
import { env } from "../../config";

// Instantiates the primary queue client for the entry stage (Stage W1: Image Captioning) of the AI pipeline
export const imageCaptioningQueue = new Queue("image-captioning", {
  connection: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
  },
  defaultJobOptions: {
    attempts: 3, // Retry up to 3 times before failing
    backoff: {
      type: "exponential",
      delay: 1000, // Double the delay time on each consecutive retry
    },
    removeOnComplete: true, // Auto-remove successful jobs to prevent Redis storage bloat
    removeOnFail: false, // Keep failed jobs in Redis for logs and manual requeues
  },
});
