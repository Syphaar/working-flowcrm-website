import { Navigate, Outlet, useLocation } from "react-router-dom";
import { storage } from "@/lib/storage";
import { AppShell } from "@/components/layout/AppShell";

export default function AuthGuard() {
  const location = useLocation();
  if (typeof window !== "undefined") {
    const session = storage.get<string | null>("auth:session", null);
    if (!session) return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
