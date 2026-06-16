/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User, Permission, RoleDefinition } from "@/lib/types";
import { ROLE_PERMISSIONS } from "@/lib/types";
import { getToken, setToken, request } from "@/services/api";
import { storage } from "@/lib/storage";
import * as authService from "@/services/auth.service";

interface AuthCtx {
  user: User | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (
    email: string,
    password: string,
    remember?: boolean,
  ) => Promise<{ ok: boolean; error?: string; requiresTwoFactor?: boolean; twoFactorToken?: string }>;
  verify2FALogin: (twoFactorToken: string, otp: string) => Promise<{ ok: boolean; error?: string }>;
  register: (data: {
    name: string;
    email: string;
    password: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  forgot: (email: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  can: (permission: Permission) => boolean;
  isAdmin: boolean;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsHydrated(true);
      return;
    }
    authService
      .getCurrentUser()
      .then(async (currentUser) => {
        setUser(currentUser);
        try {
          const roles = await request<RoleDefinition[]>("/roles");
          const stored = storage.get<Record<string, string[]>>("roles:matrix", {});
          const updated = { ...stored };
          for (const role of roles) {
            if (role.permissions) {
              updated[role.name] = role.permissions;
            }
          }
          storage.set("roles:matrix", updated);
        } catch {
          // roles fetch failed, fallback to defaults
        }
      })
      .catch(() => {
        setToken(null);
      })
      .finally(() => {
        setIsHydrated(true);
      });
  }, []);

  const logout = useCallback(() => {
    import("@/services/api").then(({ request }) => {
      request<{ ok: boolean }>("/auth/logout", { method: "POST" }).catch(() => {});
    });
    setToken(null);
    setUser(null);
  }, []);

  const isAdmin = user?.role === "super_admin";

  const can = useCallback(
    (permission: Permission) => {
      if (!user) return false;
      const matrix = storage.get<Record<string, Permission[]>>("roles:matrix", {});
      const rolePerms = matrix[user.role] ?? ROLE_PERMISSIONS[user.role];
      return rolePerms?.includes(permission) ?? false;
    },
    [user],
  );

  const value = useMemo<AuthCtx>(() => {
    const login: AuthCtx["login"] = async (email, password, _remember?) => {
      try {
        const result = await authService.login({ email, password });
        if (result.requiresTwoFactor) {
          return { ok: true, requiresTwoFactor: true, twoFactorToken: result.twoFactorToken };
        }
        setToken(result.token);
        const authenticatedUser = result.user as unknown as User;
        setUser(authenticatedUser);
        return { ok: true };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Login failed";
        return { ok: false, error: message };
      }
    };

    const verify2FALogin: AuthCtx["verify2FALogin"] = async (twoFactorToken, otp) => {
      try {
        const result = await authService.verify2FA(twoFactorToken, otp);
        setToken(result.token);
        const authenticatedUser = result.user as unknown as User;
        setUser(authenticatedUser);
        return { ok: true };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "2FA verification failed";
        return { ok: false, error: message };
      }
    };

    const register: AuthCtx["register"] = async ({ name, email, password }) => {
      try {
        const result = await authService.register({ name, email, password });
        const authenticatedUser = result.user as unknown as User;
        setUser(authenticatedUser);
        return { ok: true };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Registration failed";
        return { ok: false, error: message };
      }
    };

    const forgot: AuthCtx["forgot"] = async (email) => {
      try {
        await authService.forgotPassword(email);
        return { ok: true };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Request failed";
        return { ok: false, error: message };
      }
    };

    return {
      user,
      isAuthenticated: !!user,
      isHydrated,
      login,
      verify2FALogin,
      register,
      forgot,
      logout,
      can,
      isAdmin,
    };
  }, [user, isHydrated, logout, can, isAdmin]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const context = useContext(Ctx);
  if (!context) throw new Error("useAuth must be inside AuthProvider");
  return context;
}
