export type Role = "super_admin" | "sales_executive" | "manager" | "marketing" | (string & {});
export type Status = "online" | "away" | "offline";

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  department: string;
  role: Role;
  roles: Role[];
  avatar?: string;
  status: Status;
  lastActive: string;
  lastLogin: string;
  lastLogout: string;
  createdAt: string;
  twoFactor?: boolean;
  twoFactorSecret?: string;
}

export type LeadStage =
  | "New Lead"
  | "Contacted"
  | "Qualified"
  | "Proposal Sent"
  | "Negotiation"
  | "Won"
  | "Lost";
export type LeadStatus = "Active" | "Inactive" | "Converted" | "Lost";
export type Priority = "Low" | "Medium" | "High" | "Urgent";

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  stage: LeadStage;
  status: LeadStatus;
  ownerId: string;
  value: number;
  notes: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  companyId?: string;
  company: string;
  title: string;
  ownerId: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  website: string;
  address: string;
  revenue: number;
  employees: number;
  status: "Active" | "Prospect" | "Inactive";
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: "Active" | "Churned" | "At Risk" | "VIP";
  totalSpend: number;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Deal {
  id: string;
  name: string;
  customerId?: string;
  customerName: string;
  value: number;
  stage: string;
  status: "Open" | "Won" | "Lost";
  probability: number;
  ownerId: string;
  closeDate: string;
  createdAt: string;
  updatedAt: string;
}

export type ActivityKind =
  | "create"
  | "update"
  | "delete"
  | "assign"
  | "status_change"
  | "role_change"
  | "login"
  | "logout"
  | "notification"
  | "theme_change"
  | "stage_change"
  | "convert"
  | "complete"
  | "import"
  | "export";

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  role: Role;
  kind: ActivityKind;
  entity?: string;
  entityId?: string;
  description: string;
  createdAt: string;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  priority: Priority;
  dueDate: string;
  status: "Open" | "In Progress" | "Done";
  assigneeId: string;
  relatedTo?: { type: string; id: string };
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  attendees: string[];
  recurrence?: "none" | "daily" | "weekly" | "monthly";
  status: "Scheduled" | "Completed" | "Cancelled";
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  read: boolean;
  type: "info" | "success" | "warning" | "danger";
  createdAt: string;
}

export interface Note {
  id: string;
  authorId: string;
  authorName: string;
  body: string;
  entity: string;
  entityId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  entity: string;
  entityId: string;
  uploaderId: string;
  createdAt: string;
}

export interface Communication {
  id: string;
  channel: "email" | "call" | "sms" | "internal";
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  subject?: string;
  body: string;
  createdAt: string;
}

export interface Pipeline {
  id: string;
  name: string;
  stages: string[];
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export type Permission =
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

export const ALL_PERMISSIONS: Permission[] = [
  "view_leads",
  "edit_leads",
  "delete_leads",
  "manage_customers",
  "manage_deals",
  "view_revenue",
  "manage_reports",
  "manage_users",
  "manage_roles",
  "send_notifications",
  "view_audit",
];

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  super_admin: [...ALL_PERMISSIONS],
  manager: [
    "view_leads",
    "edit_leads",
    "manage_customers",
    "manage_deals",
    "view_revenue",
    "manage_reports",
    "send_notifications",
    "view_audit",
  ],
  sales_executive: ["view_leads", "edit_leads", "manage_customers", "manage_deals"],
  marketing: ["view_leads", "edit_leads", "send_notifications"],
};
