import { Worker, Job, Queue, UnrecoverableError } from "bullmq";
import { connection } from "../../shared/queue";
import { StorageService } from "../storage/StorageService";
import { W1Processor } from "../w1/w1.processor";
import { W2Processor } from "../w2/w2.processor";
import { W3Processor } from "../w3/w3.processor";
import { NotificationPublisher } from "../notification/NotificationPublisher";
import { logger } from "../../shared/logger";
import fs from "fs";
import path from "path";
import os from "os";

// Resolves a consistent local temp file path for a specific processing job.
// Keeping it unique per jobId prevents file access collisions during concurrent jobs.
const getLocalCachePath = (jobId: string) => {
  return path.join(os.tmpdir(), `pipeline-job-${jobId}.tmp`);
};

// Saves the image payload to a local temporary file to share it with downstream workers.
const writeLocalCache = async (jobId: string, buffer: Buffer): Promise<string> => {
  const cachePath = getLocalCachePath(jobId);
  await fs.promises.mkdir(path.dirname(cachePath), { recursive: true });
  await fs.promises.writeFile(cachePath, buffer);
  return cachePath;
};

// Reads the cached image buffer from disk. Returns null if missing to trigger network fallbacks.
const readLocalCache = async (jobId: string): Promise<Buffer | null> => {
  const cachePath = getLocalCachePath(jobId);
  try {
    return await fs.promises.readFile(cachePath);
  } catch (err) {
    return null;
  }
};

// Deletes the temporary cache file. Silently ignores errors if the file is already removed.
const deleteLocalCache = async (jobId: string): Promise<void> => {
  const cachePath = getLocalCachePath(jobId);
  try {
    await fs.promises.unlink(cachePath);
  } catch (err) {
    // Already cleaned up or never created
  }
};

// Periodic Sweeper Safeguard: Scans the OS temp folder hourly and deletes abandoned 
// pipeline-job temp files older than 15 minutes (indicating a crashed worker or failed pipeline).
export const startCacheSweeper = () => {
  const SWEEP_INTERVAL_MS = 60 * 60 * 1000; // Run once every hour
  const MAX_FILE_AGE_MS = 15 * 60 * 1000;   // Stale file threshold (15 minutes)

  setInterval(async () => {
    logger.info("[Sweeper] Running periodic local cache sweep...");
    try {
      const tempDir = os.tmpdir();
      const files = await fs.promises.readdir(tempDir);
      const now = Date.now();

      for (const file of files) {
        if (file.startsWith("pipeline-job-") && file.endsWith(".tmp")) {
          const filePath = path.join(tempDir, file);
          const stats = await fs.promises.stat(filePath);
          
          if (now - stats.mtimeMs > MAX_FILE_AGE_MS) {
            logger.info(`[Sweeper] Cleaning up abandoned cache file: ${file}`);
            await fs.promises.unlink(filePath).catch(() => {});
          }
        }
      }
    } catch (err) {
      logger.error(err as Error, "[Sweeper] Sweeper run encountered an error");
    }
  }, SWEEP_INTERVAL_MS);
};

export interface ImageCaptioningPayload {
  jobId: string;
  userId: string;
  fileKey: string;
  email?: string;
  firstName?: string;
}

export interface LabelDetectionPayload {
  jobId: string;
  userId: string;
  fileKey: string;
  email?: string;
  firstName?: string;
  caption: string;
}

export interface SafetyCheckPayload {
  jobId: string;
  userId: string;
  fileKey: string;
  email?: string;
  firstName?: string;
}

// Global queue instances for pushing tasks sequentially down the pipeline
export const imageCaptioningQueue = new Queue("image-captioning", {
  connection: connection as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

export const labelDetectionQueue = new Queue("label-detection", {
  connection: connection as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

export const safetyCheckQueue = new Queue("safety-check", {
  connection: connection as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

// Stage 1 (Safety Check Worker):
// Downloads file from Cloudflare R2, writes local cache, runs safety checks.
// If safe, enqueues to Stage 2 (Captioning). Otherwise, cleans up and notifies.
export class SafetyCheckWorker {
  private worker: Worker;
  private storageService: StorageService;
  private w3Processor: W3Processor;
  private notificationPublisher: NotificationPublisher;

  constructor() {
    this.storageService = new StorageService();
    this.w3Processor = new W3Processor();
    this.notificationPublisher = new NotificationPublisher();

    this.worker = new Worker(
      "safety-check",
      async (job: Job<SafetyCheckPayload>) => {
        await this.processJob(job.data);
      },
      {
        connection: connection as any,
        concurrency: 5,
      }
    );

    this.worker.on("completed", (job) => {
      logger.info(`[Stage 1] Job ${job.id} safety check completed!`);
    });

    this.worker.on("failed", async (job, err) => {
      logger.error(`[Stage 1] Job ${job?.id} safety check failed: ${err.message}`);
      const isPermanent =
        err instanceof UnrecoverableError ||
        (job !== undefined && job.attemptsMade >= (job.opts.attempts || 3));
      if (isPermanent && job) {
        logger.info(`[Stage 1] Job ${job.id} failed permanently. Cleaning up...`);
        await deleteLocalCache(job.data.jobId);
        await this.publishFailure(job.data.jobId, job.data.userId, err);
      }
    });
  }

  private async processJob(payload: SafetyCheckPayload) {
    const { jobId, userId, fileKey, email, firstName } = payload;
    try {
      logger.info(`[Stage 1] Downloading file from Cloudflare R2 for Job ${jobId}...`);
      const imageBuffer = await this.storageService.downloadImageBuffer(fileKey);

      logger.info(`[Stage 1] Caching image locally for Job ${jobId}...`);
      await writeLocalCache(jobId, imageBuffer);

      logger.info(`[Stage 1] Executing safe search moderation checks...`);
      const safetyResult = await this.w3Processor.process(jobId, userId, imageBuffer, email, firstName);

      if (!safetyResult.flagged) {
        logger.info(`[Stage 1] Image is safe. Enqueuing to image-captioning stage...`);
        await imageCaptioningQueue.add("image-captioning-job", payload);
      } else {
        logger.info(`[Stage 1] Image is flagged. Ending pipeline and clearing local cache...`);
        await deleteLocalCache(jobId);
      }
    } catch (error: any) {
      logger.error(`[Stage 1] Process error on Job ${jobId}:`, error);
      throw error;
    }
  }

  private async publishFailure(jobId: string, userId: string, error: any) {
    try {
      await this.notificationPublisher.publish({
        type: "FAILED",
        userId,
        jobId,
        error: error.message || "Stage 1: Safety Check failed permanently",
      });
    } catch (pubError) {
      logger.error(pubError as Error, `Failed to publish failure event for job ${jobId}`);
    }
  }

  public close() {
    return this.worker.close();
  }
}

// Stage 2 (Captioning Worker):
// Reads file from local cache, runs caption logic, and hands off to Stage 3 (Labels).
export class ImageCaptioningWorker {
  private worker: Worker;
  private storageService: StorageService;
  private w1Processor: W1Processor;
  private notificationPublisher: NotificationPublisher;

  constructor() {
    this.storageService = new StorageService();
    this.w1Processor = new W1Processor();
    this.notificationPublisher = new NotificationPublisher();

    this.worker = new Worker(
      "image-captioning",
      async (job: Job<ImageCaptioningPayload>) => {
        await this.processJob(job.data);
      },
      {
        connection: connection as any,
        concurrency: 5,
      }
    );

    this.worker.on("completed", (job) => {
      logger.info(`[Stage 2] Job ${job.id} captioning completed!`);
    });

    this.worker.on("failed", async (job, err) => {
      logger.error(`[Stage 2] Job ${job?.id} captioning failed: ${err.message}`);
      const isPermanent =
        err instanceof UnrecoverableError ||
        (job !== undefined && job.attemptsMade >= (job.opts.attempts || 3));
      if (isPermanent && job) {
        logger.info(`[Stage 2] Job ${job.id} failed permanently. Cleaning up...`);
        await deleteLocalCache(job.data.jobId);
        await this.publishFailure(job.data.jobId, job.data.userId, err);
      }
    });
  }

  private async processJob(payload: ImageCaptioningPayload) {
    const { jobId, userId, fileKey } = payload;
    try {
      logger.info(`[Stage 2] Loading image buffer for Job ${jobId}...`);
      let imageBuffer = await readLocalCache(jobId);
      
      if (!imageBuffer) {
        logger.info(`[Stage 2] Local cache miss on Job ${jobId}. Fetching from Cloudflare R2...`);
        imageBuffer = await this.storageService.downloadImageBuffer(fileKey);
        await writeLocalCache(jobId, imageBuffer);
      }

      logger.info(`[Stage 2] Generating image caption...`);
      const caption = await this.w1Processor.process(jobId, userId, imageBuffer);

      logger.info(`[Stage 2] Enqueuing to label-detection stage...`);
      await labelDetectionQueue.add("label-detection-job", {
        ...payload,
        caption,
      });
    } catch (error: any) {
      logger.error(`[Stage 2] Process error on Job ${jobId}:`, error);
      throw error;
    }
  }

  private async publishFailure(jobId: string, userId: string, error: any) {
    try {
      await this.notificationPublisher.publish({
        type: "FAILED",
        userId,
        jobId,
        error: error.message || "Stage 2: Image Captioning failed permanently",
      });
    } catch (pubError) {
      logger.error(pubError as Error, `Failed to publish failure event for job ${jobId}`);
    }
  }

  public close() {
    return this.worker.close();
  }
}

// Stage 3 (Label Detection Worker):
// Reads file from cache, runs object detection, sends final notifications, and cleans up cache.
export class LabelDetectionWorker {
  private worker: Worker;
  private storageService: StorageService;
  private w2Processor: W2Processor;
  private notificationPublisher: NotificationPublisher;

  constructor() {
    this.storageService = new StorageService();
    this.w2Processor = new W2Processor();
    this.notificationPublisher = new NotificationPublisher();

    this.worker = new Worker(
      "label-detection",
      async (job: Job<LabelDetectionPayload>) => {
        await this.processJob(job.data);
      },
      {
        connection: connection as any,
        concurrency: 5,
      }
    );

    this.worker.on("completed", (job) => {
      logger.info(`[Stage 3] Job ${job.id} label detection completed!`);
    });

    this.worker.on("failed", async (job, err) => {
      logger.error(`[Stage 3] Job ${job?.id} label detection failed: ${err.message}`);
      const isPermanent =
        err instanceof UnrecoverableError ||
        (job !== undefined && job.attemptsMade >= (job.opts.attempts || 3));
      if (isPermanent && job) {
        logger.info(`[Stage 3] Job ${job.id} failed permanently. Cleaning up...`);
        await deleteLocalCache(job.data.jobId);
        await this.publishFailure(job.data.jobId, job.data.userId, err);
      }
    });
  }

  private async processJob(payload: LabelDetectionPayload) {
    const { jobId, userId, fileKey, email, firstName } = payload;
    try {
      logger.info(`[Stage 3] Loading image buffer for Job ${jobId}...`);
      let imageBuffer = await readLocalCache(jobId);
      
      if (!imageBuffer) {
        logger.info(`[Stage 3] Local cache miss on Job ${jobId}. Fetching from Cloudflare R2...`);
        imageBuffer = await this.storageService.downloadImageBuffer(fileKey);
      }

      logger.info(`[Stage 3] Executing object detection...`);
      await this.w2Processor.process(jobId, userId, imageBuffer, email, firstName);
    } catch (error: any) {
      logger.error(`[Stage 3] Process error on Job ${jobId}:`, error);
      throw error;
    } finally {
      logger.info(`[Stage 3] Finalizing pipeline. Clearing local cache file for Job ${jobId}...`);
      await deleteLocalCache(jobId);
    }
  }

  private async publishFailure(jobId: string, userId: string, error: any) {
    try {
      await this.notificationPublisher.publish({
        type: "FAILED",
        userId,
        jobId,
        error: error.message || "Stage 3: Label Detection failed permanently",
      });
    } catch (pubError) {
      logger.error(pubError as Error, `Failed to publish failure event for job ${jobId}`);
    }
  }

  public close() {
    return this.worker.close();
  }
}
