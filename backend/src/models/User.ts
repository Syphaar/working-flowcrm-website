export type UserRole = "super_admin" | "sales_executive" | "manager" | "marketing";
export type UserStatus = "online" | "away" | "offline";

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  department: string;
  role: UserRole;
  roles: UserRole[];
  avatar?: string;
  status: UserStatus;
  lastActive: string;
  lastLogin: string;
  lastLogout: string;
  createdAt: string;
  twoFactor?: boolean;
  twoFactorSecret?: string;
}
