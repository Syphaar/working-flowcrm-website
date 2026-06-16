import { getAll, findById, insert, removeById, bulkRemoveByIds } from "../config/database.js";

export function getAllContacts() {
  return getAll<any>("contacts");
}

export function getContactById(id: string) {
  return findById<any>("contacts", id);
}

export function createContact(contactData: any, userId: string) {
  const id = `contact_${Date.now()}`;
  const now = new Date().toISOString();
  const newContact = {
    ...contactData,
    id,
    ownerId: userId,
    createdAt: now,
    updatedAt: now,
  };
  insert("contacts", newContact);
  return findById<any>("contacts", id);
}

export function updateContact(id: string, updates: any) {
  const existing = findById<any>("contacts", id);
  if (!existing) return null;

  insert("contacts", {
    ...existing,
    ...updates,
    id,
    updatedAt: new Date().toISOString(),
  });
  return findById<any>("contacts", id);
}

export function deleteContact(id: string) {
  removeById("contacts", id);
  return { ok: true };
}

export function bulkDeleteContacts(ids: string[]) {
  bulkRemoveByIds("contacts", ids);
  return { ok: true };
}
