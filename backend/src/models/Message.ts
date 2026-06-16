export type MessageChannel = "email" | "call" | "sms" | "internal";

export interface Message {
  id: string;
  channel: MessageChannel;
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  subject?: string;
  body: string;
  createdAt: string;
}
