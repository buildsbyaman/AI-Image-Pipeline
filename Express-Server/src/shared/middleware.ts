import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { ZodError } from "zod";
import { CustomError } from "./errors";
import { createResponse } from "./response";
import { logger } from "./logger";

export const setupMiddlewares = (app: Application) => {
  const morganFormat = process.env.NODE_ENV !== "production" ? "dev" : "combined";
  app.use(
    morgan(morganFormat, {
      stream: {
        write: (message) => logger.info(message.trim()),
      },
    })
  );

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

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV !== "production",
  });
  app.use(limiter);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(err.stack || err.message);

  if (err instanceof CustomError) {
    return res
      .status(err.statusCode)
      .json(createResponse(false, err.message, undefined, err.errors));
  }

  if (err instanceof ZodError) {
    const formattedErrors = err.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    return res
      .status(400)
      .json(createResponse(false, "Validation Error", undefined, formattedErrors));
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res
      .status(401)
      .json(createResponse(false, "Invalid or expired token"));
  }

  return res
    .status(500)
    .json(createResponse(false, "Internal Server Error"));
};
