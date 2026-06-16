import type { Request, Response } from "express";
import * as messageService from "../services/message.service.js";

export function getAllMessages(_request: Request, response: Response) {
  const messages = messageService.getAllMessages();
  response.json(messages);
}

export function getMessageById(request: Request, response: Response) {
  const message = messageService.getMessageById(request.params.id as string);
  if (!message) {
    response.status(404).json({ error: "Message not found" });
    return;
  }
  response.json(message);
}

export function createMessage(request: Request, response: Response) {
  const message = messageService.createMessage(request.body, request.user!);
  response.status(201).json(message);
}

export function deleteMessage(request: Request, response: Response) {
  messageService.deleteMessage(request.params.id as string);
  response.json({ ok: true });
}

export function bulkDeleteMessages(request: Request, response: Response) {
  messageService.bulkDeleteMessages(request.body.ids || []);
  response.json({ ok: true });
}
