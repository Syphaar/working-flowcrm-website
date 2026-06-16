import { request, setToken } from "./api";
import type { User, Role } from "@/lib/types";

interface AuthResponse {
  token: string;
  user: Record<string, unknown>;
  requiresTwoFactor?: boolean;
  twoFactorToken?: string;
}

async function login(payload: { email: string; password: string }): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: payload as Record<string, unknown>,
  });
}

async function register(payload: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const result = await request<AuthResponse>("/auth/register", {
    method: "POST",
    body: payload as Record<string, unknown>,
  });
  setToken(result.token);
  return result;
}

async function forgotPassword(email: string): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>("/auth/forgot", {
    method: "POST",
    body: { email } as Record<string, unknown>,
  });
}

async function getCurrentUser(): Promise<User> {
  const raw = await request<Record<string, unknown>>("/auth/me");
  return {
    id: raw.id as string,
    name: raw.name as string,
    email: raw.email as string,
    password: raw.password as string | undefined,
    phone: (raw.phone as string) || "",
    department: (raw.department as string) || "",
    role: (raw.role as Role) || "sales_executive",
    roles: (raw.roles as Role[]) || ["sales_executive"],
    avatar: raw.avatar as string | undefined,
    status: (raw.status as "online" | "away" | "offline") || "offline",
    lastActive: (raw.lastActive as string) || "",
    lastLogin: (raw.lastLogin as string) || "",
    lastLogout: (raw.lastLogout as string) || "",
    createdAt: (raw.createdAt as string) || "",
    twoFactor: (raw.twoFactor as boolean) || false,
    twoFactorSecret: raw.twoFactorSecret as string | undefined,
  };
}

async function verify2FA(twoFactorToken: string, otp: string): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/2fa/verify", {
    method: "POST",
    body: { twoFactorToken, otp } as Record<string, unknown>,
  });
}

async function setup2FA(): Promise<{ secret: string; otpauth_url: string }> {
  return request<{ secret: string; otpauth_url: string }>("/auth/2fa/setup", {
    method: "POST",
  });
}

async function enable2FA(secret: string, otp: string): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>("/auth/2fa/enable", {
    method: "POST",
    body: { secret, otp } as Record<string, unknown>,
  });
}

async function disable2FA(): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>("/auth/2fa/disable", {
    method: "POST",
  });
}

export { login, register, forgotPassword, getCurrentUser, verify2FA, setup2FA, enable2FA, disable2FA };
