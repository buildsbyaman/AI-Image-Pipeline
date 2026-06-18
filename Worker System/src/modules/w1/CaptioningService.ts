import { env } from "../../config/env";

export class CaptioningService {
  async generateCaption(imageBuffer: Buffer): Promise<string> {
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/Salesforce/blip-image-captioning-large",
      {
        headers: {
          Authorization: `Bearer ${env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/octet-stream",
        },
        method: "POST",
        body: new Uint8Array(imageBuffer),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HuggingFace API error: ${response.statusText} - ${errorText}`);
    }

    const result = (await response.json()) as any;
    
    if (Array.isArray(result) && result[0]?.generated_text) {
      return result[0].generated_text;
    }

    return "";
  }
}
