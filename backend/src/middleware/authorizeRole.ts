import type { Request, Response, NextFunction } from "express";

export function authorizeRole(...allowedRoles: string[]) {
  return (
    request: Request,
    response: Response,
    next: NextFunction
  ): void => {
    const user = request.user;

    if (!user) {
      response.status(401).json({ error: "Authentication required" });
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      response.status(403).json({
        error: "You do not have the required role for this action",
      });
      return;
    }

    next();
  };
}
