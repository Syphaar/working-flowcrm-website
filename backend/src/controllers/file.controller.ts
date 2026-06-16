import type { Request, Response } from "express";
import * as fileService from "../services/file.service.js";

export function getAttachments(request: Request, response: Response) {
  const { entity, entityId } = request.query;
  const attachments = fileService.getAttachments(
    entity as string | undefined,
    entityId as string | undefined
  );
  response.json(attachments);
}

export function uploadAttachment(request: Request, response: Response) {
  if (!request.file) {
    response.status(400).json({ error: "No file provided" });
    return;
  }

  const attachment = fileService.createAttachment(
    request.file,
    request.body,
    request.user!.userId
  );
  response.status(201).json(attachment);
}

export function deleteAttachment(request: Request, response: Response) {
  fileService.deleteAttachment(request.params.id as string);
  response.json({ ok: true });
}
