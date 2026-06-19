import { UnrecoverableError } from "bullmq";
import { env } from "../../config/env";

// gpt-4o-mini is the cheapest and fastest OpenAI model with vision support
const MODEL = "gpt-4o-mini";

export class CaptioningService {
  async generateCaption(imageBuffer: Buffer): Promise<string> {
    const base64 = imageBuffer.toString("base64");

    const body = {
      model: MODEL,
      max_tokens: 30,
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
              text: "Describe this image in a very short, crisp phrase of under 10 words. Output only the description.",
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
    return data.choices?.[0]?.message?.content?.trim() ?? "";
  }
}
