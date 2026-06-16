import type { Request, Response } from "express";
import * as dealService from "../services/deal.service.js";

export function getAllDeals(request: Request, response: Response) {
  const user = request.user!;
  const isAdmin = user.role === "super_admin";
  const deals = dealService.getAllDeals(user.userId, isAdmin);
  response.json(deals);
}

export function getDealById(request: Request, response: Response) {
  const deal = dealService.getDealById(request.params.id as string);
  if (!deal) {
    response.status(404).json({ error: "Deal not found" });
    return;
  }
  response.json(deal);
}

export function createDeal(request: Request, response: Response) {
  const deal = dealService.createDeal(request.body, request.user!.userId);
  response.status(201).json(deal);
}

export function updateDeal(request: Request, response: Response) {
  const deal = dealService.updateDeal(request.params.id as string, request.body);
  if (!deal) {
    response.status(404).json({ error: "Deal not found" });
    return;
  }
  response.json(deal);
}

export function deleteDeal(request: Request, response: Response) {
  dealService.deleteDeal(request.params.id as string);
  response.json({ ok: true });
}

export function bulkDeleteDeals(request: Request, response: Response) {
  dealService.bulkDeleteDeals(request.body.ids || []);
  response.json({ ok: true });
}
