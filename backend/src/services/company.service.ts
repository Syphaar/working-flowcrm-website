import { getAll, findById, insert, removeById, bulkRemoveByIds } from "../config/database.js";

export function getAllCompanies() {
  return getAll<any>("companies");
}

export function getCompanyById(id: string) {
  return findById<any>("companies", id);
}

export function createCompany(companyData: any, userId: string) {
  const id = `company_${Date.now()}`;
  const now = new Date().toISOString();
  const newCompany = {
    ...companyData,
    id,
    ownerId: userId,
    createdAt: now,
    updatedAt: now,
  };
  insert("companies", newCompany);
  return findById<any>("companies", id);
}

export function updateCompany(id: string, updates: any) {
  const existing = findById<any>("companies", id);
  if (!existing) return null;

  insert("companies", {
    ...existing,
    ...updates,
    id,
    updatedAt: new Date().toISOString(),
  });
  return findById<any>("companies", id);
}

export function deleteCompany(id: string) {
  removeById("companies", id);
  return { ok: true };
}

export function bulkDeleteCompanies(ids: string[]) {
  bulkRemoveByIds("companies", ids);
  return { ok: true };
}
