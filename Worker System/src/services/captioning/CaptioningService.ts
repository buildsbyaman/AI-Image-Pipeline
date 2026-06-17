import { HfInference } from "@huggingface/inference";
import { env } from "../../config/env";

export class CaptioningService {
  private hf: HfInference;

  constructor() {
    this.hf = new HfInference(env.HUGGINGFACE_API_KEY);
  }

  async generateCaption(imageBuffer: Buffer): Promise<string> {
    const result = await this.hf.imageToText({
      data: new Blob([imageBuffer as any]),
      model: "Salesforce/blip-image-captioning-base",
    });

    return result.generated_text || "";
  }
}
