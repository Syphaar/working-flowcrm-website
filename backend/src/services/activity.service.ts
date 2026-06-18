import { getAll, findById, insert, removeById, bulkRemoveByIds } from "../config/database.js";

export function getAllActivities() {
  return getAll<any>("activities").slice(0, 500);
}

export function getActivityById(id: string) {
  return findById<any>("activities", id);
}

export function createActivity(activityData: any, user: any) {
  const id = `activity_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const now = new Date().toISOString();
  const newActivity = {
    ...activityData,
    id,
    userId: user.userId,
    userName: user.name,
    role: user.role,
    createdAt: now,
  };
  insert("activities", newActivity);
  return findById<any>("activities", id);
}

export function updateActivity(id: string, updates: any) {
  const existing = findById<any>("activities", id);
  if (!existing) return null;

  insert("activities", {
    ...existing,
    ...updates,
    id,
    updatedAt: new Date().toISOString(),
  });
  return findById<any>("activities", id);
}

export function deleteActivity(id: string) {
  removeById("activities", id);
  return { ok: true };
}

export function bulkDeleteActivities(ids: string[]) {
  bulkRemoveByIds("activities", ids);
  return { ok: true };
}
