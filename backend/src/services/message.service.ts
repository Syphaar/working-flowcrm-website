import { getAll, findById, insert, removeById, bulkRemoveByIds } from "../config/database.js";

export function getAllMessages() {
  return getAll<any>("communications").slice(0, 200);
}

export function getMessageById(id: string) {
  return findById<any>("communications", id);
}

export function createMessage(messageData: any, user: any) {
  const id = `message_${Date.now()}`;
  const now = new Date().toISOString();
  const newMessage = {
    ...messageData,
    id,
    fromId: user.userId,
    fromName: user.name,
    createdAt: now,
  };
  insert("communications", newMessage);
  return findById<any>("communications", id);
}

export function deleteMessage(id: string) {
  removeById("communications", id);
  return { ok: true };
}

export function bulkDeleteMessages(ids: string[]) {
  bulkRemoveByIds("communications", ids);
  return { ok: true };
}
