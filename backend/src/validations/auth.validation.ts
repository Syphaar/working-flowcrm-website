import type { Request, Response, NextFunction } from "express";

export function validateLogin(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  const { email, password } = request.body;

  if (!email || !password) {
    response.status(400).json({ error: "Email and password are required" });
    return;
  }

  if (typeof email !== "string" || !email.includes("@")) {
    response.status(400).json({ error: "A valid email address is required" });
    return;
  }

  if (typeof password !== "string" || password.length < 6) {
    response
      .status(400)
      .json({ error: "Password must be at least 6 characters" });
    return;
  }

  next();
}

export function validateRegister(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  const { name, email, password } = request.body;

  if (!name || !email || !password) {
    response
      .status(400)
      .json({ error: "Name, email, and password are required" });
    return;
  }

  if (typeof name !== "string" || name.trim().length < 2) {
    response
      .status(400)
      .json({ error: "Name must be at least 2 characters" });
    return;
  }

  if (typeof email !== "string" || !email.includes("@")) {
    response.status(400).json({ error: "A valid email address is required" });
    return;
  }

  if (typeof password !== "string" || password.length < 6) {
    response
      .status(400)
      .json({ error: "Password must be at least 6 characters" });
    return;
  }

  next();
}

export function validateForgotPassword(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  const { email } = request.body;

  if (!email) {
    response.status(400).json({ error: "Email is required" });
    return;
  }

  if (typeof email !== "string" || !email.includes("@")) {
    response.status(400).json({ error: "A valid email address is required" });
    return;
  }

  next();
}

export function validateResetPassword(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  const { token, password } = request.body;

  if (!token || !password) {
    response.status(400).json({ error: "Token and password are required" });
    return;
  }

  if (typeof password !== "string" || password.length < 6) {
    response
      .status(400)
      .json({ error: "Password must be at least 6 characters" });
    return;
  }

  next();
}
