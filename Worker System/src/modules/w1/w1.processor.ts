import { CaptioningService } from "./CaptioningService";
import { NotificationPublisher } from "../notification/NotificationPublisher";

// Processor orchestration for the Stage W1 (Image Captioning) pipeline
export class W1Processor {
  private captioningService: CaptioningService;
  private notificationPublisher: NotificationPublisher;

  constructor() {
    this.captioningService = new CaptioningService();
    this.notificationPublisher = new NotificationPublisher();
  }

  // Executes caption generation on the image buffer and dispatches a completion notice to the queue
  async process(jobId: string, userId: string, imageBuffer: Buffer): Promise<string> {
    const caption = await this.captioningService.generateCaption(imageBuffer);

    // Publish event back to the Express Server to transition job state in the database and notify clients
    await this.notificationPublisher.publish({
      type: "W1_COMPLETED",
      userId,
      jobId,
      caption,
    });

    return caption;
  }
}
