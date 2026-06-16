import type { Request, Response } from "express";
import * as reportService from "../services/report.service.js";

export function getRevenueReport(_request: Request, response: Response) {
  const report = reportService.getRevenueReport();
  response.json(report);
}

export function getPipelineReport(_request: Request, response: Response) {
  const report = reportService.getPipelineReport();
  response.json(report);
}

export function getLeadReport(_request: Request, response: Response) {
  const report = reportService.getLeadReport();
  response.json(report);
}

export function getTeamReport(_request: Request, response: Response) {
  const report = reportService.getTeamReport();
  response.json(report);
}
