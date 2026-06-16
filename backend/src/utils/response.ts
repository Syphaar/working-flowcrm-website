import type { Response } from "express";

export function sendSuccess(
  response: Response,
  data: any,
  statusCode: number = 200
): void {
  response.status(statusCode).json(data);
}

export function sendCreated(
  response: Response,
  data: any
): void {
  response.status(201).json(data);
}

export function sendNoContent(response: Response): void {
  response.status(204).send();
}

export function sendError(
  response: Response,
  message: string,
  statusCode: number = 500
): void {
  response.status(statusCode).json({ error: message });
}

export function sendBadRequest(
  response: Response,
  message: string
): void {
  sendError(response, message, 400);
}

export function sendUnauthorized(
  response: Response,
  message: string = "Unauthorized"
): void {
  sendError(response, message, 401);
}

export function sendForbidden(
  response: Response,
  message: string = "Forbidden"
): void {
  sendError(response, message, 403);
}

export function sendNotFound(
  response: Response,
  message: string = "Not found"
): void {
  sendError(response, message, 404);
}

export function sendConflict(
  response: Response,
  message: string = "Conflict"
): void {
  sendError(response, message, 409);
}
