export type NotificationType = "info" | "success" | "warning" | "danger";

export interface Notification {
  id: string;
  title: string;
  message: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  read: boolean;
  type: NotificationType;
  createdAt: string;
}
