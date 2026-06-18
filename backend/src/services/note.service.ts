import { getAll, findById, insert, removeById, bulkRemoveByIds } from "../config/database.js";

export function getNotes(entity?: string, entityId?: string) {
  let notes = getAll<any>("notes");
  if (entity && entityId) {
    notes = notes.filter(
      (note) => note.entity === entity && note.entityId === entityId
    );
  }
  return notes;
}

export function getNoteById(id: string) {
  return findById<any>("notes", id);
}

export function createNote(noteData: any, user: any) {
  const id = `note_${Date.now()}`;
  const now = new Date().toISOString();
  const newNote = {
    ...noteData,
    id,
    authorId: user.userId,
    authorName: user.name,
    createdAt: now,
    updatedAt: now,
  };
  insert("notes", newNote);
  return findById<any>("notes", id);
}

export function updateNote(id: string, updates: any) {
  const existing = findById<any>("notes", id);
  if (!existing) return null;

  insert("notes", {
    ...existing,
    ...updates,
    id,
    updatedAt: new Date().toISOString(),
  });
  return findById<any>("notes", id);
}

export function deleteNote(id: string) {
  removeById("notes", id);
  return { ok: true };
}

export function bulkDeleteNotes(ids: string[]) {
  bulkRemoveByIds("notes", ids);
  return { ok: true };
}
