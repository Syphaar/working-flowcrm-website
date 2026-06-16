import type { Request, Response, NextFunction } from "express";

export function validateCreateCustomer(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  const { name, email } = request.body;

  if (!name) {
    response.status(400).json({ error: "Customer name is required" });
    return;
  }

  if (email && (typeof email !== "string" || !email.includes("@"))) {
    response.status(400).json({ error: "A valid email address is required" });
    return;
  }

  next();
}

export function validateUpdateCustomer(
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
