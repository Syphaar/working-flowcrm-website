import type { Request, Response, NextFunction } from "express";

export function validateCreateCompany(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  const { name } = request.body;

  if (!name) {
    response.status(400).json({ error: "Company name is required" });
    return;
  }

  next();
}

export function validateUpdateCompany(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  next();
}
