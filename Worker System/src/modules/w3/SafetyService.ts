import { ImageAnnotatorClient } from "@google-cloud/vision";

export interface SafetyResult {
  flagged: boolean;
  category?: string;
}

export class SafetyService {
  private client: ImageAnnotatorClient;

  constructor() {
    this.client = new ImageAnnotatorClient();
  }

  async checkSafety(imageBuffer: Buffer): Promise<SafetyResult> {
    const [result] = await this.client.safeSearchDetection({
      image: { content: imageBuffer },
    });
    
    const safeSearch = result.safeSearchAnnotation;
    
    if (!safeSearch) {
      return { flagged: false };
    }

    const categories = [
      { name: "adult", value: safeSearch.adult },
      { name: "violence", value: safeSearch.violence },
      { name: "medical", value: safeSearch.medical },
      { name: "spoof", value: safeSearch.spoof },
      { name: "racy", value: safeSearch.racy },
    ];

    for (const category of categories) {
      if (category.value === "LIKELY" || category.value === "VERY_LIKELY") {
        return { flagged: true, category: category.name };
      }
    }

    return { flagged: false };
  }
}
