import { Worker, Job } from "bullmq";
import { env } from "../../config/env";
import { logger } from "../../shared/utils/logger";
import { Job as JobModel, Result, JobStatus } from "@imagepipeline/db";
import Redis from "ioredis";

const redisPublisher = new Redis({
  host: env.REDIS_HOST || "localhost",
  port: (env.REDIS_PORT as number) || 6379,
});

export interface PipelineEventPayload {
  type: "IMAGE_PROCESSED_SUCCESS" | "ADULT_CONTENT_FLAGGED" | "W1_COMPLETED" | "W2_COMPLETED" | "FAILED";
  userId: string;
  jobId: string;
  caption?: string;
  labels?: string[];
  category?: string;
  error?: string;
}

export const pipelineEventsWorker = new Worker(
  "pipeline-events",
  async (job: Job<PipelineEventPayload>) => {
    const { type, userId, jobId, caption, labels, category, error } = job.data;

    logger.info(`[Express] Received pipeline event ${type} for job ${jobId}`);

    try {
      if (type === "W1_COMPLETED") {
        await JobModel.findByIdAndUpdate(jobId, { status: JobStatus.W1 });

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
            message: "Stage 1 (Image Captioning) Completed",
            jobId,
          })
        );
      } else if (type === "W2_COMPLETED") {
        await JobModel.findByIdAndUpdate(jobId, { status: JobStatus.W2 });

        await Result.findOneAndUpdate(
          { jobId },
          { labels },
          { upsert: true, new: true }
        );

        await redisPublisher.publish(
          "notification.created",
          JSON.stringify({
            event: "notification.created",
            userId,
            title: "Job Processing Update",
            message: "Stage 2 (Label Detection) Completed",
            jobId,
          })
        );
      } else if (type === "IMAGE_PROCESSED_SUCCESS" || type === "ADULT_CONTENT_FLAGGED") {
        const isFlagged = type === "ADULT_CONTENT_FLAGGED";

        await JobModel.findByIdAndUpdate(jobId, { status: JobStatus.COMPLETED });

        await Result.findOneAndUpdate(
          { jobId },
          {
            flagged: isFlagged,
            flaggedCategory: category,
            caption,
            labels,
          },
          { upsert: true, new: true }
        );

        await redisPublisher.publish(
          "notification.created",
          JSON.stringify({
            event: "notification.created",
            userId,
            title: isFlagged ? "Content Warning: Image Flagged" : "Image Processed Successfully",
            message: isFlagged 
              ? `Image has been flagged for ${category || 'adult'} content`
              : "Your image was processed successfully",
            jobId,
          })
        );
      } else if (type === "FAILED") {
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
      logger.error(`[Express] Failed to process pipeline event: ${err.message}`, err);
      throw err;
    }
  },
  {
    connection: {
      host: env.REDIS_HOST || "localhost",
      port: (env.REDIS_PORT as number) || 6379,
    },
    concurrency: 5,
  }
);

pipelineEventsWorker.on("completed", (job) => {
  logger.info(`[Express] Pipeline events job ${job.id} completed`);
});

pipelineEventsWorker.on("failed", (job, err) => {
  if (job) {
    logger.error(`[Express] Pipeline events job ${job.id} failed: ${err.message}`);
  }
});
