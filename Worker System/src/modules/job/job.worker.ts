import { Worker, Job } from "bullmq";
import { connection } from "../../shared/queue";
import { StorageService } from "../storage/StorageService";
import { W1Processor } from "../w1/w1.processor";
import { W2Processor } from "../w2/w2.processor";
import { W3Processor } from "../w3/w3.processor";
import { NotificationPublisher } from "../notification/NotificationPublisher";

export interface ImageProcessingPayload {
  jobId: string;
  userId: string;
  fileKey: string;
  email?: string;
  firstName?: string;
}

export class ImageProcessingWorker {
  private worker: Worker;
  private storageService: StorageService;
  private w1Processor: W1Processor;
  private w2Processor: W2Processor;
  private w3Processor: W3Processor;
  private notificationPublisher: NotificationPublisher;

  constructor() {
    this.storageService = new StorageService();
    this.w1Processor = new W1Processor();
    this.w2Processor = new W2Processor();
    this.w3Processor = new W3Processor();
    this.notificationPublisher = new NotificationPublisher();

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
    const { jobId, userId, fileKey, email, firstName } = payload;

    try {
      // 1. Download Image
      const imageBuffer = await this.storageService.downloadImageBuffer(fileKey);

      // 2. Process AI Pipeline Sequentially and capture results to carry forward
      console.log(`[Job ${jobId}] Starting Stage W1 (Captioning)...`);
      const caption = await this.w1Processor.process(jobId, userId, imageBuffer);

      console.log(`[Job ${jobId}] Starting Stage W2 (Label Detection)...`);
      const labels = await this.w2Processor.process(jobId, userId, imageBuffer);

      console.log(`[Job ${jobId}] Starting Stage W3 (Safety Check)...`);
      await this.w3Processor.process(jobId, userId, imageBuffer, caption, labels, email, firstName);

    } catch (error: any) {
      console.error(`Failed processing job ${jobId}:`, error);
      try {
        await this.notificationPublisher.publish({
          type: "FAILED",
          userId,
          jobId,
          error: error.message || "Unknown error",
        });
      } catch (pubError) {
        console.error(`Failed publishing failure notification for job ${jobId}:`, pubError);
      }
      throw error; // Let BullMQ handle the retry mechanism
    }
  }

  public close() {
    return this.worker.close();
  }
}
