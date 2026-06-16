import { getAll, findById, insert, removeById, bulkRemoveByIds } from "../config/database.js";

export function getAllEvents() {
  const events = getAll<any>("events");
  return events.sort(
    (eventA, eventB) => new Date(eventA.startsAt).getTime() - new Date(eventB.startsAt).getTime()
  );
}

export function getEventById(id: string) {
  return findById<any>("events", id);
}

export function createEvent(eventData: any) {
  const id = `event_${Date.now()}`;
  const now = new Date().toISOString();
  const newEvent = {
    ...eventData,
    id,
    createdAt: now,
    updatedAt: now,
  };
  insert("events", newEvent);
  return findById<any>("events", id);
}

export function updateEvent(id: string, updates: any) {
  const existing = findById<any>("events", id);
  if (!existing) return null;

  insert("events", {
    ...existing,
    ...updates,
    id,
    updatedAt: new Date().toISOString(),
  });
  return findById<any>("events", id);
}

export function deleteEvent(id: string) {
  removeById("events", id);
  return { ok: true };
}

export function bulkDeleteEvents(ids: string[]) {
  bulkRemoveByIds("events", ids);
  return { ok: true };
}
