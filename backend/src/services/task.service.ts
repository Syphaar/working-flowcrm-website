import { getAll, findById, insert, removeById, bulkRemoveByIds } from "../config/database.js";

export function getAllTasks(userId: string, isAdmin: boolean) {
  let tasks = getAll<any>("tasks");
  if (!isAdmin) {
    tasks = tasks.filter((task) => task.assigneeId === userId);
  }
  return tasks;
}

export function getTaskById(id: string) {
  return findById<any>("tasks", id);
}

export function createTask(taskData: any, userId: string) {
  const id = `task_${Date.now()}`;
  const now = new Date().toISOString();
  const newTask = {
    ...taskData,
    id,
    assigneeId: userId,
    createdAt: now,
    updatedAt: now,
  };
  insert("tasks", newTask);
  return findById<any>("tasks", id);
}

export function updateTask(id: string, updates: any) {
  const existing = findById<any>("tasks", id);
  if (!existing) return null;

  insert("tasks", {
    ...existing,
    ...updates,
    id,
    updatedAt: new Date().toISOString(),
  });
  return findById<any>("tasks", id);
}

export function deleteTask(id: string) {
  removeById("tasks", id);
  return { ok: true };
}

export function bulkDeleteTasks(ids: string[]) {
  bulkRemoveByIds("tasks", ids);
  return { ok: true };
}
