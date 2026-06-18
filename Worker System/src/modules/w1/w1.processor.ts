import { CaptioningService } from "./CaptioningService";
import { NotificationPublisher } from "../notification/NotificationPublisher";

export class W1Processor {
  private captioningService: CaptioningService;
  private notificationPublisher: NotificationPublisher;

  constructor() {
    this.captioningService = new CaptioningService();
    this.notificationPublisher = new NotificationPublisher();
  }

  async process(jobId: string, userId: string, imageBuffer: Buffer): Promise<string> {
    const caption = await this.captioningService.generateCaption(imageBuffer);

    await this.notificationPublisher.publish({
      type: "W1_COMPLETED",
      userId,
      jobId,
      caption,
    });

    return caption;
  }
}
