import { SafetyService, SafetyResult } from "./SafetyService";
import { NotificationPublisher } from "../notification/NotificationPublisher";
import { Queue } from "bullmq";
import { connection } from "../../shared/queue";

// Orchestrates the final Stage W3 (Safety Screening) pipeline execution and schedules notifications
export class W3Processor {
  private safetyService: SafetyService;
  private notificationPublisher: NotificationPublisher;
  private emailQueue: Queue;

  constructor() {
    this.safetyService = new SafetyService();
    this.notificationPublisher = new NotificationPublisher();
    // Connects directly to the email service queue running in the Email System
    this.emailQueue = new Queue("email-queue", { connection: connection as any });
  }

  // Screens the image, publishes the terminal job execution status, and schedules email alerts
  async process(
    jobId: string,
    userId: string,
    imageBuffer: Buffer,
    caption: string,
    labels: string[],
    email?: string,
    firstName?: string
  ): Promise<SafetyResult> {
    const safetyResult = await this.safetyService.checkSafety(imageBuffer);

    // Notify backend if the image passed moderation checks or got flagged
    if (safetyResult.flagged && safetyResult.category) {
      await this.notificationPublisher.publish({
        type: "CONTENT_FLAGGED",
        userId,
        jobId,
        category: safetyResult.category,
        caption,
        labels,
      });
    } else {
      await this.notificationPublisher.publish({
        type: "IMAGE_PROCESSED_SUCCESS",
        userId,
        jobId,
        caption,
        labels,
      });
    }

    // Hand over email formatting and sending to the dedicated Email System asynchronously
    if (email && firstName) {
      try {
        await this.emailQueue.add(
          "send-pipeline-email",
          {
            to: email,
            userName: firstName,
            type: safetyResult.flagged ? "CONTENT_FLAGGED" : "IMAGE_PROCESSED_SUCCESS",
            jobId,
            category: safetyResult.category,
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

    return safetyResult;
  }
}
