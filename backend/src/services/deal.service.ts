import { getAll, findById, insert, removeById, bulkRemoveByIds } from "../config/database.js";

export function getAllDeals(userId: string, isAdmin: boolean) {
  let deals = getAll<any>("deals");
  if (!isAdmin) {
    deals = deals.filter((deal) => deal.ownerId === userId);
  }
  return deals;
}

export function getDealById(id: string) {
  return findById<any>("deals", id);
}

export function createDeal(dealData: any, userId: string) {
  const id = `deal_${Date.now()}`;
  const now = new Date().toISOString();
  const newDeal = {
    ...dealData,
    id,
    ownerId: userId,
    createdAt: now,
    updatedAt: now,
  };
  insert("deals", newDeal);
  return findById<any>("deals", id);
}

export function updateDeal(id: string, updates: any) {
  const existing = findById<any>("deals", id);
  if (!existing) return null;

  insert("deals", {
    ...existing,
    ...updates,
    id,
    updatedAt: new Date().toISOString(),
  });
  return findById<any>("deals", id);
}

export function deleteDeal(id: string) {
  removeById("deals", id);
  return { ok: true };
}

export function bulkDeleteDeals(ids: string[]) {
  bulkRemoveByIds("deals", ids);
  return { ok: true };
}
