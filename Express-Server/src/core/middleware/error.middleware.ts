import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { CustomError } from "../../shared/utils/errors";
import { createResponse } from "../../shared/utils/response";
import { logger } from "../../shared/utils/logger";

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

  // Handle generic JWT errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res
      .status(401)
      .json(createResponse(false, "Invalid or expired token"));
  }

  return res
    .status(500)
    .json(createResponse(false, "Internal Server Error"));
};
