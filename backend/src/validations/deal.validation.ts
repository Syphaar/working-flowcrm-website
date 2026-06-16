import type { Request, Response, NextFunction } from "express";

export function validateCreateDeal(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  const { name, value } = request.body;

  if (!name) {
    response.status(400).json({ error: "Deal name is required" });
    return;
  }

  if (value !== undefined && (typeof value !== "number" || value < 0)) {
    response.status(400).json({ error: "Value must be a positive number" });
    return;
  }

  next();
}

export function validateUpdateDeal(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  const { value } = request.body;

  if (value !== undefined && (typeof value !== "number" || value < 0)) {
    response.status(400).json({ error: "Value must be a positive number" });
    return;
  }

  next();
}
