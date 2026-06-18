import { UnrecoverableError } from "bullmq";
import { env } from "../../config/env";

const MODEL = "gpt-4o-mini";

export class VisionLabelService {
  // Sends the image to OpenAI and returns a list of detected labels/objects
  async detectLabels(imageBuffer: Buffer): Promise<string[]> {
    const base64 = imageBuffer.toString("base64");

    const body = {
      model: MODEL,
      max_tokens: 150,
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
              text: "List the key objects, scenes, and concepts visible in this image. Output only a comma-separated list of short labels (e.g. 'dog, park, sunny day, green grass'). No explanations.",
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
    const raw: string = data.choices?.[0]?.message?.content?.trim() ?? "";

    // Parse comma-separated labels and clean whitespace
    return raw
      .split(",")
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 0);
  }
}
