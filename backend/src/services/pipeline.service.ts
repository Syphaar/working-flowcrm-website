import { getAll, findById, insert, removeById, bulkRemoveByIds } from "../config/database.js";

export function getAllPipelines() {
  return getAll<any>("pipelines");
}

export function getPipelineById(id: string) {
  return findById<any>("pipelines", id);
}

export function createPipeline(body: any) {
  const id = `pl_${Date.now()}`;
  const now = new Date().toISOString();
  const pipeline = {
    ...body,
    id,
    createdAt: now,
    updatedAt: now,
  };
  insert("pipelines", pipeline);
  return findById<any>("pipelines", id);
}

export function updatePipeline(id: string, updates: any) {
  const existing = findById<any>("pipelines", id);
  if (!existing) return null;
  insert("pipelines", { ...existing, ...updates, id, updatedAt: new Date().toISOString() });
  return findById<any>("pipelines", id);
}

export function deletePipeline(id: string) {
  removeById("pipelines", id);
  return { ok: true };
}

export function bulkDeletePipelines(ids: string[]) {
  bulkRemoveByIds("pipelines", ids);
  return { ok: true };
}
