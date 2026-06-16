import type { UserRole } from "./User.js";

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
  role: UserRole;
  kind: ActivityKind;
  entity?: string;
  entityId?: string;
  description: string;
  createdAt: string;
}
