import type { Request, Response } from "express";
import * as leadService from "../services/lead.service.js";

export function getAllLeads(request: Request, response: Response) {
  const user = request.user!;
  const isAdmin = user.role === "super_admin";
  const leads = leadService.getAllLeads(user.userId, isAdmin);
  response.json(leads);
}

export function getLeadById(request: Request, response: Response) {
  const lead = leadService.getLeadById(request.params.id as string);
  if (!lead) {
    response.status(404).json({ error: "Lead not found" });
    return;
  }
  response.json(lead);
}

export function createLead(request: Request, response: Response) {
  const lead = leadService.createLead(request.body, request.user!.userId);
  response.status(201).json(lead);
}

export function updateLead(request: Request, response: Response) {
  const lead = leadService.updateLead(request.params.id as string, request.body);
  if (!lead) {
    response.status(404).json({ error: "Lead not found" });
    return;
  }
  response.json(lead);
}

export function deleteLead(request: Request, response: Response) {
  leadService.deleteLead(request.params.id as string);
  response.json({ ok: true });
}

export function bulkDeleteLeads(request: Request, response: Response) {
  leadService.bulkDeleteLeads(request.body.ids || []);
  response.json({ ok: true });
}
