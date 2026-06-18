import pino from "pino";
import { env } from "../config";

// Development uses pino-pretty for clean local terminal logs.
// Production outputs raw JSON to stdout so log collectors can parse it easily.
export const logger = pino({
  level: env.NODE_ENV === "development" ? "debug" : "info",
  transport: env.NODE_ENV === "development"
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:yyyy-mm-dd HH:MM:ss",
          ignore: "pid,hostname",
        },
      }
    : undefined,
});
