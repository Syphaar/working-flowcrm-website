import type { Request, Response, NextFunction } from "express";

export function validateCreateUser(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  const { name, email } = request.body;

  if (!name) {
    response.status(400).json({ error: "Name is required" });
    return;
  }

  if (email && (typeof email !== "string" || !email.includes("@"))) {
    response.status(400).json({ error: "A valid email address is required" });
    return;
  }

  next();
}

export function validateUpdateUser(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  const { email } = request.body;

  if (email && (typeof email !== "string" || !email.includes("@"))) {
    response.status(400).json({ error: "A valid email address is required" });
    return;
  }

  next();
}
