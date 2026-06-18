import Redis from "ioredis";
import { env } from "../config/env";

// Shared Redis connection instance for BullMQ queues.
// maxRetriesPerRequest is set to null as strictly required by BullMQ's connection management.
export const connection = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  maxRetriesPerRequest: null,
});
