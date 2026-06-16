import { getAll, findById, insert, removeById, bulkRemoveByIds } from "../config/database.js";

export function getAllLeads(userId: string, isAdmin: boolean) {
  let leads = getAll<any>("leads");
  if (!isAdmin) {
    leads = leads.filter((lead) => lead.ownerId === userId);
  }
  return leads;
}

export function getLeadById(id: string) {
  return findById<any>("leads", id);
}

export function createLead(leadData: any, userId: string) {
  const id = `lead_${Date.now()}`;
  const now = new Date().toISOString();
  const newLead = {
    ...leadData,
    id,
    ownerId: userId,
    createdAt: now,
    updatedAt: now,
  };
  insert("leads", newLead);
  return findById<any>("leads", id);
}

export function updateLead(id: string, updates: any) {
  const existing = findById<any>("leads", id);
  if (!existing) return null;

  insert("leads", {
    ...existing,
    ...updates,
    id,
    updatedAt: new Date().toISOString(),
  });
  return findById<any>("leads", id);
}

export function deleteLead(id: string) {
  removeById("leads", id);
  return { ok: true };
}

export function bulkDeleteLeads(ids: string[]) {
  bulkRemoveByIds("leads", ids);
  return { ok: true };
}
