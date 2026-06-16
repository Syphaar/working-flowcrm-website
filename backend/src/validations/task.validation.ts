import type { Request, Response, NextFunction } from "express";

export function validateCreateTask(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  const { name } = request.body;

  if (!name) {
    response.status(400).json({ error: "Task name is required" });
    return;
  }

  next();
}

export function validateUpdateTask(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  next();
}
