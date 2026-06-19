import { getAll, findById, insert } from "../config/database.js";
import { hashPassword, comparePassword } from "../auth/password.js";
import { signToken, signTwoFactorToken, verifyTwoFactorToken } from "../auth/jwt.js";
import {
  generatePasswordResetToken,
  verifyPasswordResetToken,
  markResetTokenAsUsed,
} from "../auth/token.service.js";
import { sendPasswordResetEmail } from "./email.service.js";
import type { User } from "../models/User.js";
import speakeasy from "speakeasy";

export async function loginUser(email: string, password: string) {
  const users = getAll<any>("users");
  const user = users.find(
    (user) => user.email.toLowerCase() === email.toLowerCase()
  );

  if (!user) {
    throw new Error("No account found with that email address");
  }

  const passwordMatches = await comparePassword(password, user.password);
  if (!passwordMatches) {
    throw new Error("Incorrect password");
  }

  if (user.twoFactor) {
    const twoFactorToken = signTwoFactorToken({ userId: user.id });
    return { requiresTwoFactor: true, twoFactorToken };
  }

  const now = new Date().toISOString();
  const lastLogout = typeof user.lastLogout === "string" ? user.lastLogout : now;
  const updatedUser = {
    ...user,
    status: "online",
    lastLogin: now,
    lastActive: now,
    lastLogout,
  };
  insert("users", updatedUser);

  let token: string;
  try {
    token = signToken({
      userId: user.id,
      name: user.name,
      role: user.role,
    });
  } catch (err) {
    throw new Error(`Failed to sign token: ${(err as Error).message}`);
  }

  const { password: _, ...userWithoutPassword } = updatedUser;
  return { token, user: userWithoutPassword };
}

export async function verifyTwoFactorLogin(twoFactorToken: string, otp: string) {
  const payload = verifyTwoFactorToken(twoFactorToken);
  if (!payload) {
    throw new Error("Invalid or expired 2FA token");
  }

  const user = findById<any>("users", payload.userId);
  if (!user) {
    throw new Error("User not found");
  }

  if (!user.twoFactorSecret) {
    throw new Error("2FA not configured");
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token: otp,
    window: 1,
  });

  if (!verified) {
    throw new Error("Invalid 2FA code");
  }

  const now = new Date().toISOString();
  const updatedUser = {
    ...user,
    status: "online",
    lastLogin: now,
    lastActive: now,
  };
  insert("users", updatedUser);

  const token = signToken({
    userId: user.id,
    name: user.name,
    role: user.role,
  });

  const { password: _, ...userWithoutPassword } = updatedUser;
  return { token, user: userWithoutPassword };
}

export function generate2FASecret(userId: string) {
  const user = findById<any>("users", userId);
  if (!user) {
    throw new Error("User not found");
  }

  const secret = speakeasy.generateSecret({ length: 20, name: `FlowCRM:${user.email}` });
  return {
    secret: secret.base32,
    otpauth_url: secret.otpauth_url,
  };
}

export async function enable2FA(userId: string, secret: string, otp: string) {
  const user = findById<any>("users", userId);
  if (!user) {
    throw new Error("User not found");
  }

  const verified = speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token: otp,
    window: 1,
  });

  if (!verified) {
    throw new Error("Invalid 2FA code");
  }

  insert("users", {
    ...user,
    twoFactor: true,
    twoFactorSecret: secret,
  });

  return { ok: true };
}

export async function disable2FA(userId: string) {
  const user = findById<any>("users", userId);
  if (!user) {
    throw new Error("User not found");
  }

  insert("users", {
    ...user,
    twoFactor: false,
    twoFactorSecret: undefined,
  });

  return { ok: true };
}

export async function registerUser(
  name: string,
  email: string,
  password: string
) {
  const users = getAll<any>("users");

  if (
    users.some(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    )
  ) {
    throw new Error("An account with this email already exists");
  }

  const hashedPassword = await hashPassword(password);
  const id = `user_${Date.now()}`;
  const now = new Date().toISOString();

  const newUser = {
    id,
    name,
    email,
    password: hashedPassword,
    phone: "",
    department: "Sales",
    role: "sales_executive",
    roles: ["sales_executive"],
    status: "online",
    lastActive: now,
    lastLogin: now,
    lastLogout: now,
    createdAt: now,
    twoFactor: false,
  };

  insert("users", newUser);

  let token: string;
  try {
    token = signToken({
      userId: id,
      name,
      role: "sales_executive",
    });
  } catch (err) {
    throw new Error(`Failed to sign token: ${(err as Error).message}`);
  }

  const { password: _, ...userWithoutPassword } = newUser;
  return { token, user: userWithoutPassword };
}

export async function forgotPassword(email: string) {
  const users = getAll<any>("users");
  const user = users.find(
    (user) => user.email.toLowerCase() === email.toLowerCase()
  );

  if (!user) {
    throw new Error("No account found with that email address");
  }

  const resetToken = generatePasswordResetToken(user.id);
  await sendPasswordResetEmail(email, resetToken);

  return { ok: true };
}

export async function resetPassword(token: string, newPassword: string) {
  const tokenData = verifyPasswordResetToken(token);

  if (!tokenData) {
    throw new Error("Invalid or expired reset token");
  }

  const user = findById<any>("users", tokenData.userId);
  if (!user) {
    throw new Error("User not found");
  }

  const hashedPassword = await hashPassword(newPassword);
  insert("users", {
    ...user,
    password: hashedPassword,
  });

  markResetTokenAsUsed(token);

  return { ok: true };
}

export function logoutUser(userId: string) {
  const user = findById<any>("users", userId);
  if (!user) return;

  const now = new Date().toISOString();
  insert("users", {
    ...user,
    status: "offline",
    lastLogout: now,
  });
}

export function getCurrentUser(userId: string) {
  const user = findById<any>("users", userId);
  if (!user) {
    throw new Error("User not found");
  }

  const { password: _, twoFactorSecret: __, ...userWithoutSensitive } = user;
  return userWithoutSensitive;
}
