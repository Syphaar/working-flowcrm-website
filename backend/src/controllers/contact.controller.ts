import type { Request, Response } from "express";
import * as contactService from "../services/contact.service.js";

export function getAllContacts(_request: Request, response: Response) {
  const contacts = contactService.getAllContacts();
  response.json(contacts);
}

export function getContactById(request: Request, response: Response) {
  const contact = contactService.getContactById(request.params.id as string);
  if (!contact) {
    response.status(404).json({ error: "Contact not found" });
    return;
  }
  response.json(contact);
}

export function createContact(request: Request, response: Response) {
  const contact = contactService.createContact(
    request.body,
    request.user!.userId
  );
  response.status(201).json(contact);
}

export function updateContact(request: Request, response: Response) {
  const contact = contactService.updateContact(
    request.params.id as string,
    request.body
  );
  if (!contact) {
    response.status(404).json({ error: "Contact not found" });
    return;
  }
  response.json(contact);
}

export function deleteContact(request: Request, response: Response) {
  contactService.deleteContact(request.params.id as string);
  response.json({ ok: true });
}

export function bulkDeleteContacts(request: Request, response: Response) {
  contactService.bulkDeleteContacts(request.body.ids || []);
  response.json({ ok: true });
}
