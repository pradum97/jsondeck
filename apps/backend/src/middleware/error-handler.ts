import type { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
  }
}

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = error instanceof AppError ? error.statusCode : 500;
  const message = error.message || "Unexpected server error";

  logger.error("Request failed", {
    requestId: req.requestId,
    statusCode,
    message,
    path: req.originalUrl,
  });

  res.status(statusCode).json({
    error: {
      message,
      requestId: req.requestId,
    },
  });
};
