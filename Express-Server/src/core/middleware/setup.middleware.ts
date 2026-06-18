import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { logger } from "../../shared/utils/logger";

/**
 * Applies all global middlewares to the Express application.
 */
export const setupMiddlewares = (app: Application) => {
  // Logging Middleware
  const morganFormat = process.env.NODE_ENV !== "production" ? "dev" : "combined";
  app.use(
    morgan(morganFormat, {
      stream: {
        write: (message) => logger.info(message.trim()),
      },
    })
  );

  // Security Middlewares
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );
  app.use(
    cors({
      origin: process.env.NODE_ENV === "production" ? "https://yourdomain.com" : ["http://localhost:3000", "http://localhost:5173"],
      credentials: true,
    })
  );

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per `window`
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV !== "production", // Skip rate limiting in dev
  });
  app.use(limiter);

  // Parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
};
