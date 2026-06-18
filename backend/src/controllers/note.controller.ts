import type { Request, Response } from "express";
import * as noteService from "../services/note.service.js";

export function getNotes(request: Request, response: Response) {
  const { entity, entityId } = request.query;
  const notes = noteService.getNotes(
    entity as string | undefined,
    entityId as string | undefined
  );
  response.json(notes);
}

export function getNoteById(request: Request, response: Response) {
  const note = noteService.getNoteById(request.params.id as string);
  if (!note) {
    response.status(404).json({ error: "Note not found" });
    return;
  }
  response.json(note);
}

export function createNote(request: Request, response: Response) {
  const note = noteService.createNote(request.body, request.user!);
  response.status(201).json(note);
}

export function updateNote(request: Request, response: Response) {
  const note = noteService.updateNote(request.params.id as string, request.body);
  if (!note) {
    response.status(404).json({ error: "Note not found" });
    return;
  }
  response.json(note);
}

export function deleteNote(request: Request, response: Response) {
  noteService.deleteNote(request.params.id as string);
  response.json({ ok: true });
}

export function bulkDeleteNotes(request: Request, response: Response) {
  noteService.bulkDeleteNotes(request.body.ids || []);
  response.json({ ok: true });
}
