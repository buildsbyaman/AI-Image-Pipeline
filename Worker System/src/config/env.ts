import { z } from "zod";
import * as dotenv from "dotenv";

import * as path from "path";

// Load configuration parameters from the local .env file
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Schema definition for the microservice configuration.
const envSchema = z.object({
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string(),
  R2_SECRET_ACCESS_KEY: z.string(),
  R2_BUCKET_NAME: z.string(),
  CLOUDFLARE_ACCOUNT_ID: z.string(),
  OPENAI_API_KEY: z.string(),
  NODE_ENV: z.string().default("development"),
});

const _env = envSchema.safeParse(process.env);

// Abort start-up immediately if any environment configurations are invalid or missing
if (!_env.success) {
  console.error("❌ Worker environment validation failed:", _env.error.format());
  process.exit(1);
}

export const env = _env.data;
