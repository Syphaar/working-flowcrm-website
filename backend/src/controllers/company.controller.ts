import type { Request, Response } from "express";
import * as companyService from "../services/company.service.js";

export function getAllCompanies(_request: Request, response: Response) {
  const companies = companyService.getAllCompanies();
  response.json(companies);
}

export function getCompanyById(request: Request, response: Response) {
  const company = companyService.getCompanyById(request.params.id as string);
  if (!company) {
    response.status(404).json({ error: "Company not found" });
    return;
  }
  response.json(company);
}

export function createCompany(request: Request, response: Response) {
  const company = companyService.createCompany(
    request.body,
    request.user!.userId
  );
  response.status(201).json(company);
}

export function updateCompany(request: Request, response: Response) {
  const company = companyService.updateCompany(
    request.params.id as string,
    request.body
  );
  if (!company) {
    response.status(404).json({ error: "Company not found" });
    return;
  }
  response.json(company);
}

export function deleteCompany(request: Request, response: Response) {
  companyService.deleteCompany(request.params.id as string);
  response.json({ ok: true });
}

export function bulkDeleteCompanies(request: Request, response: Response) {
  companyService.bulkDeleteCompanies(request.body.ids || []);
  response.json({ ok: true });
}
