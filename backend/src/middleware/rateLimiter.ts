import type { Request, Response, NextFunction } from "express";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const requestCounts = new Map<string, RateLimitEntry>();

export function rateLimiter(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  const isDev = process.env.NODE_ENV !== "production";
  const windowMs = isDev ? 60000 : parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10);
  const maxRequests = isDev ? 1000 : parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10);

  const ip = request.ip || request.socket.remoteAddress || "unknown";
  const now = Date.now();

  const entry = requestCounts.get(ip);

  if (!entry || now > entry.resetTime) {
    requestCounts.set(ip, {
      count: 1,
      resetTime: now + windowMs,
    });
    next();
    return;
  }

  entry.count++;

  if (entry.count > maxRequests) {
    response.status(429).json({
      error: "Too many requests. Please try again later.",
    });
    return;
  }

  next();
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of requestCounts.entries()) {
    if (now > entry.resetTime) {
      requestCounts.delete(ip);
    }
  }
}, 60000);
