import { UnrecoverableError } from "bullmq";
import { env } from "../../config/env";

export interface SafetyResult {
  flagged: boolean;
  category?: string;
}

const MODEL = "gpt-4o-mini";

export class SafetyService {
  // Uses OpenAI to check for unsafe content and returns a flagged result with a category if found
  async checkSafety(imageBuffer: Buffer): Promise<SafetyResult> {
    const base64 = imageBuffer.toString("base64");

    const body = {
      model: MODEL,
      max_tokens: 60,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64}`, detail: "low" },
            },
            {
              type: "text",
              text: `You are a content moderation system. Analyze this image for unsafe content.
If the image is safe, respond with exactly: SAFE
If the image contains unsafe content, respond with exactly one of these labels that best matches:
adult, violence, medical, spoof, racy
Respond with only one word. No explanations.`,
            },
          ],
        },
      ],
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      const message = `OpenAI API error (${response.status}): ${errorText}`;

      // 4xx errors won't succeed on retry
      if (response.status >= 400 && response.status < 500) {
        throw new UnrecoverableError(message);
      }
      throw new Error(message);
    }

    const data = (await response.json()) as any;
    const verdict: string = data.choices?.[0]?.message?.content?.trim().toLowerCase() ?? "safe";

    if (verdict === "safe") {
      return { flagged: false };
    }

    // Any non-safe label is treated as a flagged category
    const knownCategories = ["adult", "violence", "medical", "spoof", "racy"];
    const category = knownCategories.find((c) => verdict.includes(c)) ?? verdict;

    return { flagged: true, category };
  }
}
