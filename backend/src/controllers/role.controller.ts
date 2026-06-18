import type { Request, Response } from "express";
import * as roleService from "../services/role.service.js";

export function getAllRoles(_request: Request, response: Response) {
  const roles = roleService.getAllRoles();
  response.json(roles);
}

export function getRoleById(request: Request, response: Response) {
  const role = roleService.getRoleById(request.params.id as string);
  if (!role) {
    response.status(404).json({ error: "Role not found" });
    return;
  }
  response.json(role);
}

export function createRole(request: Request, response: Response) {
  const role = roleService.createRole(request.body);
  response.status(201).json(role);
}

export function updateRole(request: Request, response: Response) {
  const role = roleService.updateRole(request.params.id as string, request.body);
  if (!role) {
    response.status(404).json({ error: "Role not found" });
    return;
  }
  response.json(role);
}

export function deleteRole(request: Request, response: Response) {
  roleService.deleteRole(request.params.id as string);
  response.json({ ok: true });
}

export function bulkDeleteRoles(request: Request, response: Response) {
  roleService.bulkDeleteRoles(request.body.ids || []);
  response.json({ ok: true });
}
