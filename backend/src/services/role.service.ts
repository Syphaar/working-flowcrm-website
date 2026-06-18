import { getAll, findById, insert, removeById, bulkRemoveByIds } from "../config/database.js";

const defaultRoles = [
  {
    id: "role_super_admin",
    name: "super_admin",
    description: "Full system access with all permissions",
    permissions: [
      "view_leads", "edit_leads", "delete_leads",
      "manage_customers", "manage_deals",
      "view_revenue", "manage_reports",
      "manage_users", "manage_roles", "send_notifications", "view_audit",
    ],
  },
  {
    id: "role_manager",
    name: "manager",
    description: "Can manage team and view reports",
    permissions: [
      "view_leads", "edit_leads",
      "manage_customers", "manage_deals",
      "view_revenue", "manage_reports", "send_notifications", "view_audit",
    ],
  },
  {
    id: "role_sales_executive",
    name: "sales_executive",
    description: "Can manage leads, customers, and deals",
    permissions: [
      "view_leads", "edit_leads",
      "manage_customers", "manage_deals",
    ],
  },
  {
    id: "role_marketing",
    name: "marketing",
    description: "Can view leads and send notifications",
    permissions: [
      "view_leads", "edit_leads", "send_notifications",
    ],
  },
];

export function getAllRoles() {
  const existingRoles = getAll<any>("roles");
  if (existingRoles.length === 0) {
    for (const role of defaultRoles) {
      insert("roles", role);
    }
    return defaultRoles;
  }
  return existingRoles;
}

export function getRoleById(id: string) {
  return findById<any>("roles", id);
}

export function createRole(roleData: any) {
  const id = `role_${Date.now()}`;
  const now = new Date().toISOString();
  const newRole = {
    name: roleData.name,
    description: roleData.description || "",
    permissions: roleData.permissions || [],
    ...roleData,
    id,
    createdAt: now,
    updatedAt: now,
  };
  insert("roles", newRole);
  return findById<any>("roles", id);
}

export function updateRole(id: string, updates: any) {
  const existing = findById<any>("roles", id);
  if (!existing) return null;

  insert("roles", { ...existing, ...updates, id });
  return findById<any>("roles", id);
}

export function deleteRole(id: string) {
  removeById("roles", id);
  return { ok: true };
}

export function bulkDeleteRoles(ids: string[]) {
  bulkRemoveByIds("roles", ids);
  return { ok: true };
}
