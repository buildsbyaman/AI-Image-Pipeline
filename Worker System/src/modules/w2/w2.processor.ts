import { VisionLabelService } from "./VisionLabelService";
import { NotificationPublisher } from "../notification/NotificationPublisher";
import { Queue } from "bullmq";
import { connection } from "../../shared/queue";

// Orchestrates the final stage (Label Detection) pipeline execution
export class W2Processor {
  private visionLabelService: VisionLabelService;
  private notificationPublisher: NotificationPublisher;
  private emailQueue: Queue;

  constructor() {
    this.visionLabelService = new VisionLabelService();
    this.notificationPublisher = new NotificationPublisher();
    this.emailQueue = new Queue("email-queue", { connection: connection as any });
  }

  // Identifies objects/features in the image buffer and dispatches results to Express Server, then schedules success email
  async process(
    jobId: string,
    userId: string,
    imageBuffer: Buffer,
    email?: string,
    firstName?: string
  ): Promise<string[]> {
    const labels = await this.visionLabelService.detectLabels(imageBuffer);

    // Notify the main backend with the success event
    await this.notificationPublisher.publish({
      type: "IMAGE_PROCESSED_SUCCESS",
      userId,
      jobId,
      labels,
    });

    // Hand over success email formatting and sending asynchronously
    if (email && firstName) {
      try {
        await this.emailQueue.add(
          "send-pipeline-email",
          {
            to: email,
            userName: firstName,
            type: "IMAGE_PROCESSED_SUCCESS",
            jobId,
          },
          {
            attempts: 3,
            backoff: {
              type: "exponential",
              delay: 5000,
            },
          }
        );
      } catch (err) {
        console.error(`Failed to queue email to email-queue for job ${jobId}:`, err);
      }
    }

    return labels;
  }
}

