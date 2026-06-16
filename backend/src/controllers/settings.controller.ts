import type { Request, Response } from "express";
import { getAll, findById, insert } from "../config/database.js";

export function getSettings(_request: Request, response: Response) {
  response.json({
    companyName: "FlowCRM Enterprise",
    timezone: "UTC",
    dateFormat: "MM/DD/YYYY",
    currency: "USD",
    emailNotifications: true,
    twoFactorAuth: false,
  });
}

export function updateSettings(request: Request, response: Response) {
  const settings = request.body;
  response.json(settings);
}
