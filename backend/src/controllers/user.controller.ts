import type { Request, Response } from "express";
import * as userService from "../services/user.service.js";

export function getAllUsers(request: Request, response: Response) {
  const isAdmin = request.user?.role === "super_admin";
  const users = userService.getAllUsers(isAdmin);
  response.json(users);
}

export function getUserById(request: Request, response: Response) {
  const isAdmin = request.user?.role === "super_admin";
  const user = userService.getUserById(request.params.id as string, isAdmin);
  if (!user) {
    response.status(404).json({ error: "User not found" });
    return;
  }
  response.json(user);
}

export function createUser(request: Request, response: Response) {
  const user = userService.createUser(request.body);
  response.status(201).json(user);
}

export function updateUser(request: Request, response: Response) {
  const user = userService.updateUser(request.params.id as string, request.body);
  if (!user) {
    response.status(404).json({ error: "User not found" });
    return;
  }
  response.json(user);
}

export function deleteUser(request: Request, response: Response) {
  userService.deleteUser(request.params.id as string);
  response.json({ ok: true });
}

export function bulkDeleteUsers(request: Request, response: Response) {
  userService.bulkDeleteUsers(request.body.ids || []);
  response.json({ ok: true });
}
