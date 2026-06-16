import type { UserRole } from "./User.js";

export interface Role {
  id: string;
  name: UserRole;
  description: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}
