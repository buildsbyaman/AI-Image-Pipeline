import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  logger.error(`Error processing request: ${err.message}`, { stack: err.stack, path: req.path });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Handle specific Prisma errors, Zod errors, etc., here if needed.
  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors,
    });
  }

  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};
