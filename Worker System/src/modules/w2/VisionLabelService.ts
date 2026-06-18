import { ImageAnnotatorClient } from "@google-cloud/vision";

export class VisionLabelService {
  private client: ImageAnnotatorClient;

  constructor() {
    this.client = new ImageAnnotatorClient();
  }

  async detectLabels(imageBuffer: Buffer): Promise<string[]> {
    const [result] = await this.client.labelDetection({
      image: { content: imageBuffer },
    });
    const labels = result.labelAnnotations || [];
    return labels.map((label: any) => label.description || "").filter((desc: string) => desc !== "");
  }
}
