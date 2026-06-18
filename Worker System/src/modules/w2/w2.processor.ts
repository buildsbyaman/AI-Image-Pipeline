import { VisionLabelService } from "./VisionLabelService";
import { NotificationPublisher } from "../notification/NotificationPublisher";

export class W2Processor {
  private visionLabelService: VisionLabelService;
  private notificationPublisher: NotificationPublisher;

  constructor() {
    this.visionLabelService = new VisionLabelService();
    this.notificationPublisher = new NotificationPublisher();
  }

  async process(jobId: string, userId: string, imageBuffer: Buffer): Promise<string[]> {
    const labels = await this.visionLabelService.detectLabels(imageBuffer);

    await this.notificationPublisher.publish({
      type: "W2_COMPLETED",
      userId,
      jobId,
      labels,
    });

    return labels;
  }
}
