import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../auth/jwt.js";
import type { AuthenticationPayload } from "../auth/auth.types.js";

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticationPayload;
    }
  }
}

export function authenticateUser(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  const authorizationHeader = request.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    response.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const token = authorizationHeader.slice(7);
    const payload = verifyToken(token);
    request.user = payload;
    next();
  } catch {
    response.status(401).json({ error: "Invalid or expired token" });
  }
}
