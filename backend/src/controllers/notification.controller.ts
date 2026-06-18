import type { Request, Response } from "express";
import * as notificationService from "../services/notification.service.js";

export function getNotifications(request: Request, response: Response) {
  const user = request.user!;
  const isAdmin = user.role === "super_admin";
  const notifications = notificationService.getNotifications(
    user.userId,
    isAdmin
  );
  response.json(notifications);
}

export function getNotificationById(request: Request, response: Response) {
  const notification = notificationService.getNotificationById(
    request.params.id as string
  );
  if (!notification) {
    response.status(404).json({ error: "Notification not found" });
    return;
  }
  response.json(notification);
}

export function createNotification(request: Request, response: Response) {
  const notification = notificationService.createNotification(
    request.body,
    request.user!
  );
  response.status(201).json(notification);
}

export function updateNotification(request: Request, response: Response) {
  const notification = notificationService.updateNotification(
    request.params.id as string,
    request.body
  );
  if (!notification) {
    response.status(404).json({ error: "Notification not found" });
    return;
  }
  response.json(notification);
}

export function deleteNotification(request: Request, response: Response) {
  notificationService.deleteNotification(request.params.id as string);
  response.json({ ok: true });
}

export function bulkDeleteNotifications(
  request: Request,
  response: Response
) {
  notificationService.bulkDeleteNotifications(request.body.ids || []);
  response.json({ ok: true });
}
