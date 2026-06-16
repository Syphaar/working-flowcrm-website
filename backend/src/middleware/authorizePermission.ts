import type { Request, Response, NextFunction } from "express";
import * as roleService from "../services/role.service.js";

export function authorizePermission(...requiredPermissions: string[]) {
  return (request: Request, response: Response, next: NextFunction): void => {
    const user = request.user;

    if (!user) {
      response.status(401).json({ error: "Authentication required" });
      return;
    }

    const roles = roleService.getAllRoles();
    const roleDef = roles.find(
      (r: any) => r.name === user.role
    );
    const userPermissions: string[] = roleDef?.permissions || [];

    const hasAllPermissions = requiredPermissions.every(
      (requiredPermission) => userPermissions.includes(requiredPermission)
    );

    if (!hasAllPermissions) {
      response.status(403).json({
        error: "You do not have the required permissions for this action",
      });
      return;
    }

    next();
  };
}
