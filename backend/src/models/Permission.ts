export type PermissionName =
  | "view_leads"
  | "edit_leads"
  | "delete_leads"
  | "manage_customers"
  | "manage_deals"
  | "view_revenue"
  | "manage_reports"
  | "manage_users"
  | "manage_roles"
  | "send_notifications"
  | "view_audit";

export interface Permission {
  id: string;
  name: PermissionName;
  description: string;
  createdAt: string;
}
