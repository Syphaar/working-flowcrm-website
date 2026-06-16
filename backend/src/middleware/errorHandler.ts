import type { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";

export function errorHandler(
  error: Error,
  _request: Request,
  response: Response,
  _next: NextFunction
): void {
  logger.error("Unhandled error", {
    message: error.message,
    stack: error.stack,
  });

  if (error.name === "ValidationError") {
    response.status(400).json({ error: error.message });
    return;
  }

  if (error.name === "UnauthorizedError") {
    response.status(401).json({ error: error.message });
    return;
  }

  if (error.name === "ForbiddenError") {
    response.status(403).json({ error: error.message });
    return;
  }

  if (error.name === "NotFoundError") {
    response.status(404).json({ error: error.message });
    return;
  }

  if (error.name === "MulterError") {
    response.status(400).json({ error: error.message });
    return;
  }

  response.status(500).json({
    error: "Internal server error",
  });
}
