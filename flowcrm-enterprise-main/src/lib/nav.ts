import {
  LayoutDashboard,
  Users,
  UserPlus,
  Building2,
  Briefcase,
  KanbanSquare,
  Activity,
  ListChecks,
  Calendar,
  BarChart3,
  Bell,
  MessageSquare,
  ShieldCheck,
  Cog,
  FileText,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Permission } from "@/lib/types";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  perm?: Permission;
  adminOnly?: boolean;
  group: "Workspace" | "Sales" | "Customers" | "Insights" | "Admin";
}

export const NAV: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, group: "Workspace" },
  { to: "/leads", label: "Leads", icon: UserPlus, perm: "view_leads", group: "Sales" },
  { to: "/contacts", label: "Contacts", icon: Users, group: "Sales" },
  { to: "/companies", label: "Companies", icon: Building2, group: "Sales" },
  { to: "/pipeline", label: "Pipeline", icon: KanbanSquare, perm: "manage_deals", group: "Sales" },
  { to: "/deals", label: "Deals", icon: Briefcase, perm: "manage_deals", group: "Sales" },
  {
    to: "/customers",
    label: "Customers",
    icon: UsersRound,
    perm: "manage_customers",
    group: "Customers",
  },
  { to: "/tasks", label: "Tasks", icon: ListChecks, group: "Workspace" },
  { to: "/calendar", label: "Calendar", icon: Calendar, group: "Workspace" },
  { to: "/activities", label: "Activities", icon: Activity, group: "Workspace" },
  { to: "/communications", label: "Communications", icon: MessageSquare, group: "Workspace" },
  { to: "/notifications", label: "Notifications", icon: Bell, group: "Workspace" },
  { to: "/reports", label: "Reports", icon: BarChart3, perm: "manage_reports", group: "Insights" },
  { to: "/team", label: "Team", icon: Users, perm: "manage_users", group: "Admin" },
  {
    to: "/roles",
    label: "Roles & Permissions",
    icon: ShieldCheck,
    perm: "manage_roles",
    group: "Admin",
  },
  { to: "/audit", label: "Audit Log", icon: FileText, perm: "view_audit", group: "Admin" },
  { to: "/settings", label: "Settings", icon: Cog, group: "Workspace" },
];
