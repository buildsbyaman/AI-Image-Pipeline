import { VisionLabelService } from "./VisionLabelService";
import { NotificationPublisher } from "../notification/NotificationPublisher";

// Orchestrates the Stage W2 (Label Detection) pipeline execution
export class W2Processor {
  private visionLabelService: VisionLabelService;
  private notificationPublisher: NotificationPublisher;

  constructor() {
    this.visionLabelService = new VisionLabelService();
    this.notificationPublisher = new NotificationPublisher();
  }

  // Identifies objects/features in the image buffer and dispatches results to Express Server
  async process(jobId: string, userId: string, imageBuffer: Buffer): Promise<string[]> {
    const labels = await this.visionLabelService.detectLabels(imageBuffer);

    // Notify the main backend with the array of detected labels for progressive results storage
    await this.notificationPublisher.publish({
      type: "W2_COMPLETED",
      userId,
      jobId,
      labels,
    });

    return labels;
  }
}
