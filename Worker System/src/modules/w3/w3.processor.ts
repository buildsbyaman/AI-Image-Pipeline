import { SafetyService, SafetyResult } from "./SafetyService";
import { NotificationPublisher } from "../notification/NotificationPublisher";
import { Queue } from "bullmq";
import { connection } from "../../shared/queue";

export class W3Processor {
  private safetyService: SafetyService;
  private notificationPublisher: NotificationPublisher;
  private emailQueue: Queue;

  constructor() {
    this.safetyService = new SafetyService();
    this.notificationPublisher = new NotificationPublisher();
    this.emailQueue = new Queue("email-queue", { connection: connection as any });
  }

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

    if (safetyResult.flagged && safetyResult.category) {
      await this.notificationPublisher.publish({
        type: "ADULT_CONTENT_FLAGGED",
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

    if (email && firstName) {
      try {
        await this.emailQueue.add("send-pipeline-email", {
          to: email,
          userName: firstName,
          type: safetyResult.flagged ? "ADULT_CONTENT_FLAGGED" : "IMAGE_PROCESSED_SUCCESS",
          jobId,
          category: safetyResult.category,
        });
      } catch (err) {
        console.error(`Failed to queue email to email-queue for job ${jobId}:`, err);
      }
    }

    return safetyResult;
  }
}
