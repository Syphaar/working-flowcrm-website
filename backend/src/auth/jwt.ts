import jwt from "jsonwebtoken";
import { environment } from "../config/environment.js";
import type { AuthenticationPayload } from "./auth.types.js";

export function signToken(payload: AuthenticationPayload): string {
  return jwt.sign(payload, environment.jwtSecret, {
    expiresIn: environment.jwtExpiresIn as any,
  });
}

export function verifyToken(token: string): AuthenticationPayload {
  return jwt.verify(
    token,
    environment.jwtSecret
  ) as AuthenticationPayload;
}

export function signTwoFactorToken(payload: { userId: string }): string {
  return jwt.sign(payload, environment.jwtSecret, { expiresIn: "5m" });
}

export function verifyTwoFactorToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, environment.jwtSecret) as { userId: string };
  } catch {
    return null;
  }
}
