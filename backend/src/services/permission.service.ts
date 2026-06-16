import { getAll, findById } from "../config/database.js";

const defaultPermissions = [
  { id: "perm_view_leads", name: "view_leads", description: "View leads in the system" },
  { id: "perm_edit_leads", name: "edit_leads", description: "Create and edit leads" },
  { id: "perm_delete_leads", name: "delete_leads", description: "Delete leads" },
  { id: "perm_manage_customers", name: "manage_customers", description: "Manage customer records" },
  { id: "perm_manage_deals", name: "manage_deals", description: "Manage deals pipeline" },
  { id: "perm_view_revenue", name: "view_revenue", description: "View revenue data" },
  { id: "perm_manage_reports", name: "manage_reports", description: "Create and manage reports" },
  { id: "perm_manage_users", name: "manage_users", description: "Manage user accounts" },
  { id: "perm_manage_roles", name: "manage_roles", description: "Manage roles and permissions" },
  { id: "perm_send_notifications", name: "send_notifications", description: "Send notifications" },
  { id: "perm_view_audit", name: "view_audit", description: "View audit log" },
];

export function getAllPermissions() {
  return defaultPermissions;
}

export function getPermissionById(id: string) {
  return defaultPermissions.find((permission) => permission.id === id) || null;
}

export function getPermissionsByRole(role: string): string[] {
  const rolePermissions: Record<string, string[]> = {
    super_admin: [
      "view_leads", "edit_leads", "delete_leads",
      "manage_customers", "manage_deals",
      "view_revenue", "manage_reports",
      "manage_users", "manage_roles", "send_notifications", "view_audit",
    ],
    manager: [
      "view_leads", "edit_leads",
      "manage_customers", "manage_deals",
      "view_revenue", "manage_reports", "send_notifications", "view_audit",
    ],
    sales_executive: [
      "view_leads", "edit_leads",
      "manage_customers", "manage_deals",
    ],
    marketing: [
      "view_leads", "edit_leads", "send_notifications",
    ],
  };

  return rolePermissions[role] || [];
}
