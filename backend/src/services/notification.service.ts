import { getAll, findById, insert, removeById, bulkRemoveByIds } from "../config/database.js";
import { emitToUser } from "../config/socket.js";

export function getNotificationById(id: string) {
  return findById<any>("notifications", id);
}

export function getNotifications(userId: string, isAdmin: boolean) {
  let notifications = getAll<any>("notifications");
  if (!isAdmin) {
    notifications = notifications.filter(
      (notification) => notification.recipientId === userId
    );
  }
  return notifications;
}

export function createNotification(notificationData: any, user: any) {
  const id = `notification_${Date.now()}`;
  const now = new Date().toISOString();
  const newNotification = {
    ...notificationData,
    id,
    senderId: user.userId,
    senderName: user.name,
    read: false,
    createdAt: now,
  };

  insert("notifications", newNotification);

  emitToUser(newNotification.recipientId, "new_notification", newNotification);

  return findById<any>("notifications", id);
}

export function updateNotification(id: string, updates: any) {
  const existing = findById<any>("notifications", id);
  if (!existing) return null;

  insert("notifications", { ...existing, ...updates, id });
  return findById<any>("notifications", id);
}

export function deleteNotification(id: string) {
  removeById("notifications", id);
  return { ok: true };
}

export function bulkDeleteNotifications(ids: string[]) {
  bulkRemoveByIds("notifications", ids);
  return { ok: true };
}
