import path from "path";
import fs from "fs";
import { getAll, findById, insert, removeById, bulkRemoveByIds } from "../config/database.js";
import { uploadsPath } from "../config/storage.js";

export function getAttachments(entity?: string, entityId?: string) {
  let attachments = getAll<any>("attachments");
  if (entity && entityId) {
    attachments = attachments.filter(
      (attachment) =>
        attachment.entity === entity && attachment.entityId === entityId
    );
  }
  return attachments;
}

export function getAttachmentById(id: string) {
  return findById<any>("attachments", id);
}

export function createAttachment(file: Express.Multer.File, body: any, userId: string) {
  const id = `attachment_${Date.now()}`;
  const now = new Date().toISOString();
  const newAttachment = {
    id,
    name: file.originalname,
    size: file.size,
    type: file.mimetype || "application/octet-stream",
    entity: body.entity || "",
    entityId: body.entityId || "",
    uploaderId: userId,
    createdAt: now,
  };
  insert("attachments", newAttachment);
  return findById<any>("attachments", id);
}

export function createAttachmentFromData(data: any, userId: string) {
  const id = `attachment_${Date.now()}`;
  const now = new Date().toISOString();
  const newAttachment = {
    ...data,
    id,
    uploaderId: userId,
    createdAt: now,
    updatedAt: now,
  };
  insert("attachments", newAttachment);
  return findById<any>("attachments", id);
}

export function updateAttachment(id: string, updates: any) {
  const existing = findById<any>("attachments", id);
  if (!existing) return null;

  insert("attachments", {
    ...existing,
    ...updates,
    id,
    updatedAt: new Date().toISOString(),
  });
  return findById<any>("attachments", id);
}

export function deleteAttachment(id: string) {
  const attachment = findById<any>("attachments", id);
  if (attachment) {
    const filePath = path.join(uploadsPath, attachment.name);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
  removeById("attachments", id);
  return { ok: true };
}

export function bulkDeleteAttachments(ids: string[]) {
  for (const id of ids) {
    const attachment = findById<any>("attachments", id);
    if (attachment) {
      const filePath = path.join(uploadsPath, attachment.name);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }
  bulkRemoveByIds("attachments", ids);
  return { ok: true };
}
