import { Worker, Job } from "bullmq";
import { env } from "../../config";
import { logger } from "../../shared/logger";
import { Job as JobModel, Result, JobStatus } from "../../database";
import Redis from "ioredis";

// Instantiate Redis publisher connection for pushing real-time WS notifications
const redisPublisher = new Redis({
  host: env.REDIS_HOST || "localhost",
  port: (env.REDIS_PORT as number) || 6379,
  password: env.REDIS_PASSWORD,
});

export interface PipelineEventPayload {
  type: "IMAGE_PROCESSED_SUCCESS" | "CONTENT_FLAGGED" | "W1_COMPLETED" | "W2_COMPLETED" | "FAILED";
  userId: string;
  jobId: string;
  caption?: string;
  labels?: string[];
  category?: string;
  error?: string;
}

// BullMQ Worker that processes pipeline progression milestones emitted by the Worker System.
// This bridges the worker microservice events back to the primary MongoDB database.
export const pipelineEventsWorker = new Worker(
  "pipeline-events",
  async (job: Job<PipelineEventPayload>) => {
    const { type, userId, jobId, caption, labels, category, error } = job.data;

    logger.info(`[Express Worker] Processing pipeline event ${type} for Job ID: ${jobId}`);

    try {
      if (type === "W1_COMPLETED") {
        // Stage 1 (Safety Check) completes: update job status
        await JobModel.findByIdAndUpdate(jobId, { status: JobStatus.W1 });

        await Result.findOneAndUpdate(
          { jobId },
          { flagged: false },
          { upsert: true, new: true }
        );

        // Publish event to Redis Pub/Sub so that Socket.IO gateway triggers WebSockets to frontend
        await redisPublisher.publish(
          "notification.created",
          JSON.stringify({
            event: "notification.created",
            userId,
            title: "Job Processing Update",
            message: "Stage 1 (Content Safety Check) Completed",
            jobId,
          })
        );
      } else if (type === "W2_COMPLETED") {
        // Stage 2 (Captioning) completes: update job status and save generated caption
        await JobModel.findByIdAndUpdate(jobId, { status: JobStatus.W2 });

        await Result.findOneAndUpdate(
          { jobId },
          { caption },
          { upsert: true, new: true }
        );

        await redisPublisher.publish(
          "notification.created",
          JSON.stringify({
            event: "notification.created",
            userId,
            title: "Job Processing Update",
            message: "Stage 2 (Image Captioning) Completed",
            jobId,
          })
        );
      } else if (type === "IMAGE_PROCESSED_SUCCESS" || type === "CONTENT_FLAGGED") {
        // Terminal Stage 3 completes: update final status and cache screening results
        const isFlagged = type === "CONTENT_FLAGGED";

        await JobModel.findByIdAndUpdate(jobId, { status: JobStatus.COMPLETED });

        const updateFields: any = { flagged: isFlagged };
        if (isFlagged) {
          updateFields.flaggedCategory = category;
        } else {
          updateFields.labels = labels;
        }

        await Result.findOneAndUpdate(
          { jobId },
          updateFields,
          { upsert: true, new: true }
        );

        await redisPublisher.publish(
          "notification.created",
          JSON.stringify({
            event: "notification.created",
            userId,
            title: isFlagged ? "Content Warning: Image Flagged" : "Image Processed Successfully",
            message: isFlagged 
              ? `Image has been flagged for ${category || 'flagged'} content`
              : "Your image was processed successfully",
            jobId,
          })
        );
      } else if (type === "FAILED") {
        // Pipeline failed in any of the stages: update DB status and broadcast the failure
        await JobModel.findByIdAndUpdate(jobId, { status: JobStatus.FAILED, error });

        await redisPublisher.publish(
          "notification.created",
          JSON.stringify({
            event: "notification.created",
            userId,
            title: "Job Processing Failed",
            message: error || "An unknown error occurred during processing",
            jobId,
          })
        );
      }
    } catch (err: any) {
      logger.error(`[Express Worker] Error executing database updates for event ${type}: ${err.message}`, err);
      throw err;
    }
  },
  {
    connection: {
      host: env.REDIS_HOST || "localhost",
      port: (env.REDIS_PORT as number) || 6379,
      password: env.REDIS_PASSWORD,
    },
    concurrency: 5,
  }
);

// Worker Event Listeners for telemetry logging
pipelineEventsWorker.on("completed", (job) => {
  logger.info(`[Express Worker] Pipeline events job ${job.id} completed successfully`);
});

pipelineEventsWorker.on("failed", (job, err) => {
  if (job) {
    logger.error(`[Express Worker] Pipeline events job ${job.id} failed: ${err.message}`);
  }
});
