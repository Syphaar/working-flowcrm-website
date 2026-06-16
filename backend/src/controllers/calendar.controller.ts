import type { Request, Response } from "express";
import * as calendarService from "../services/calendar.service.js";

export function getAllEvents(_request: Request, response: Response) {
  const events = calendarService.getAllEvents();
  response.json(events);
}

export function getEventById(request: Request, response: Response) {
  const event = calendarService.getEventById(request.params.id as string);
  if (!event) {
    response.status(404).json({ error: "Event not found" });
    return;
  }
  response.json(event);
}

export function createEvent(request: Request, response: Response) {
  const event = calendarService.createEvent(request.body);
  response.status(201).json(event);
}

export function updateEvent(request: Request, response: Response) {
  const event = calendarService.updateEvent(request.params.id as string, request.body);
  if (!event) {
    response.status(404).json({ error: "Event not found" });
    return;
  }
  response.json(event);
}

export function deleteEvent(request: Request, response: Response) {
  calendarService.deleteEvent(request.params.id as string);
  response.json({ ok: true });
}

export function bulkDeleteEvents(request: Request, response: Response) {
  calendarService.bulkDeleteEvents(request.body.ids || []);
  response.json({ ok: true });
}
