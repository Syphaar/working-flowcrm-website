import { getAll, findById, insert, removeById, bulkRemoveByIds } from "../config/database.js";

export function getAllUsers(includePassword = false) {
  const users = getAll<any>("users");
  if (includePassword) return users;
  return users.map(({ password, ...rest }) => rest);
}

export function getUserById(id: string, includePassword = false) {
  const user = findById<any>("users", id);
  if (!user) return null;
  if (includePassword) return user;
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export function createUser(userData: any) {
  const id = `user_${Date.now()}`;
  const now = new Date().toISOString();

  const newUser = {
    name: userData.name,
    email:
      userData.email ||
      `${userData.name.toLowerCase().replace(/\s+/g, ".")}@flowcrm.com`,
    password: "",
    phone: userData.phone || "",
    department: userData.department || "Sales",
    role: userData.role || "sales_executive",
    roles: [userData.role || "sales_executive"],
    status: "offline",
    lastActive: now,
    lastLogin: "",
    lastLogout: "",
    twoFactor: false,
    twoFactorSecret: "",
    ...userData,
    id,
    createdAt: now,
  };

  insert("users", newUser);
  const { password, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
}

export function updateUser(id: string, updates: any) {
  const existing = findById<any>("users", id);
  if (!existing) return null;

  const { id: _, ...validUpdates } = updates;
  insert("users", { ...existing, ...validUpdates, id });

  const updated = findById<any>("users", id);
  const { password, ...userWithoutPassword } = updated;
  return userWithoutPassword;
}

export function deleteUser(id: string) {
  removeById("users", id);
  return { ok: true };
}

export function bulkDeleteUsers(ids: string[]) {
  bulkRemoveByIds("users", ids);
  return { ok: true };
}
