import type { Request, Response } from "express";
import * as customerService from "../services/customer.service.js";

export function getAllCustomers(request: Request, response: Response) {
  const user = request.user!;
  const isAdmin = user.role === "super_admin";
  const customers = customerService.getAllCustomers(user.userId, isAdmin);
  response.json(customers);
}

export function getCustomerById(request: Request, response: Response) {
  const customer = customerService.getCustomerById(request.params.id as string);
  if (!customer) {
    response.status(404).json({ error: "Customer not found" });
    return;
  }
  response.json(customer);
}

export function createCustomer(request: Request, response: Response) {
  const customer = customerService.createCustomer(
    request.body,
    request.user!.userId
  );
  response.status(201).json(customer);
}

export function updateCustomer(request: Request, response: Response) {
  const customer = customerService.updateCustomer(
    request.params.id as string,
    request.body
  );
  if (!customer) {
    response.status(404).json({ error: "Customer not found" });
    return;
  }
  response.json(customer);
}

export function deleteCustomer(request: Request, response: Response) {
  customerService.deleteCustomer(request.params.id as string);
  response.json({ ok: true });
}

export function bulkDeleteCustomers(request: Request, response: Response) {
  customerService.bulkDeleteCustomers(request.body.ids || []);
  response.json({ ok: true });
}
