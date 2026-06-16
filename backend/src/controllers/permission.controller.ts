import type { Request, Response } from "express";
import * as permissionService from "../services/permission.service.js";

export function getAllPermissions(_request: Request, response: Response) {
  const permissions = permissionService.getAllPermissions();
  response.json(permissions);
}

export function getPermissionById(request: Request, response: Response) {
  const permission = permissionService.getPermissionById(request.params.id as string);
  if (!permission) {
    response.status(404).json({ error: "Permission not found" });
    return;
  }
  response.json(permission);
}
