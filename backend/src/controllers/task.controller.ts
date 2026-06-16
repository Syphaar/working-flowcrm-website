import type { Request, Response } from "express";
import * as taskService from "../services/task.service.js";

export function getAllTasks(request: Request, response: Response) {
  const user = request.user!;
  const isAdmin = user.role === "super_admin";
  const tasks = taskService.getAllTasks(user.userId, isAdmin);
  response.json(tasks);
}

export function getTaskById(request: Request, response: Response) {
  const task = taskService.getTaskById(request.params.id as string);
  if (!task) {
    response.status(404).json({ error: "Task not found" });
    return;
  }
  response.json(task);
}

export function createTask(request: Request, response: Response) {
  const task = taskService.createTask(request.body, request.user!.userId);
  response.status(201).json(task);
}

export function updateTask(request: Request, response: Response) {
  const task = taskService.updateTask(request.params.id as string, request.body);
  if (!task) {
    response.status(404).json({ error: "Task not found" });
    return;
  }
  response.json(task);
}

export function deleteTask(request: Request, response: Response) {
  taskService.deleteTask(request.params.id as string);
  response.json({ ok: true });
}

export function bulkDeleteTasks(request: Request, response: Response) {
  taskService.bulkDeleteTasks(request.body.ids || []);
  response.json({ ok: true });
}
