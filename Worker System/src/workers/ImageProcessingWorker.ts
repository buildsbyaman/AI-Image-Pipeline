import { Worker, Job } from "bullmq";
import { connection } from "../queues/connection";
import { StorageService } from "../services/storage/StorageService";
import { CaptioningService } from "../services/captioning/CaptioningService";
import { VisionLabelService } from "../services/vision/VisionLabelService";
import { SafetyService } from "../services/safety/SafetyService";
import { NotificationPublisher } from "../services/notifications/NotificationPublisher";
import { JobRepository } from "../repositories/JobRepository";

export interface ImageProcessingPayload {
  jobId: string;
  userId: string;
  fileKey: string;
}

export class ImageProcessingWorker {
  private worker: Worker;
  private storageService: StorageService;
  private captioningService: CaptioningService;
  private visionLabelService: VisionLabelService;
  private safetyService: SafetyService;
  private notificationPublisher: NotificationPublisher;
  private jobRepository: JobRepository;

  constructor() {
    this.storageService = new StorageService();
    this.captioningService = new CaptioningService();
    this.visionLabelService = new VisionLabelService();
    this.safetyService = new SafetyService();
    this.notificationPublisher = new NotificationPublisher();
    this.jobRepository = new JobRepository();

    this.worker = new Worker(
      "image-processing",
      async (job: Job<ImageProcessingPayload>) => {
        await this.processJob(job.data);
      },
      {
        connection: connection as any,
        concurrency: 5,
      }
    );

    this.worker.on("completed", (job) => {
      console.log(`Job ${job.id} has completed!`);
    });

    this.worker.on("failed", (job, err) => {
      console.error(`Job ${job?.id} has failed with ${err.message}`);
    });
  }

  private async processJob(payload: ImageProcessingPayload) {
    const { jobId, userId, fileKey } = payload;

    try {
      // 1. Update status to PROCESSING
      await this.jobRepository.updateJobStatus(jobId, "PROCESSING");

      // 2. Download Image
      const imageBuffer = await this.storageService.downloadImageBuffer(fileKey);

      // 3. Process AI Pipeline Sequentially
      const caption = await this.captioningService.generateCaption(imageBuffer);
      const labels = await this.visionLabelService.detectLabels(imageBuffer);
      const safetyResult = await this.safetyService.checkSafety(imageBuffer);

      // 4. Save result and update job status
      await this.jobRepository.saveResultAndUpdateJob({
        jobId,
        caption,
        labels,
        flagged: safetyResult.flagged,
        flaggedCategory: safetyResult.category,
      });

      // 5. Publish notifications
      if (safetyResult.flagged && safetyResult.category) {
        await this.notificationPublisher.publish({
          type: "ADULT_CONTENT_FLAGGED",
          userId,
          jobId,
          category: safetyResult.category,
        });
      } else {
        await this.notificationPublisher.publish({
          type: "IMAGE_PROCESSED_SUCCESS",
          userId,
          jobId,
        });
      }
    } catch (error: any) {
      console.error(`Failed processing job ${jobId}:`, error);
      await this.jobRepository.updateJobStatus(jobId, "FAILED", error.message || "Unknown error");
      throw error; // Let BullMQ handle the retry mechanism
    }
  }

  public close() {
    return this.worker.close();
  }
}
