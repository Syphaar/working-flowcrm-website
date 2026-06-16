import { getAll, findById, insert, removeById, bulkRemoveByIds } from "../config/database.js";

export function getAllCustomers(userId: string, isAdmin: boolean) {
  let customers = getAll<any>("customers");
  if (!isAdmin) {
    customers = customers.filter((customer) => customer.ownerId === userId);
  }
  return customers;
}

export function getCustomerById(id: string) {
  return findById<any>("customers", id);
}

export function createCustomer(customerData: any, userId: string) {
  const id = `customer_${Date.now()}`;
  const now = new Date().toISOString();
  const newCustomer = {
    ...customerData,
    id,
    ownerId: userId,
    createdAt: now,
    updatedAt: now,
  };
  insert("customers", newCustomer);
  return findById<any>("customers", id);
}

export function updateCustomer(id: string, updates: any) {
  const existing = findById<any>("customers", id);
  if (!existing) return null;

  insert("customers", {
    ...existing,
    ...updates,
    id,
    updatedAt: new Date().toISOString(),
  });
  return findById<any>("customers", id);
}

export function deleteCustomer(id: string) {
  removeById("customers", id);
  return { ok: true };
}

export function bulkDeleteCustomers(ids: string[]) {
  bulkRemoveByIds("customers", ids);
  return { ok: true };
}
