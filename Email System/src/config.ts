import { z } from 'zod';
import dotenv from 'dotenv';

import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const envSchema = z.object({
  PORT: z.string().default('5005'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  RESEND_API_KEY: z.string(),
  EMAIL_FROM: z.string().email(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  process.exit(1);
}

export const env = _env.data;
