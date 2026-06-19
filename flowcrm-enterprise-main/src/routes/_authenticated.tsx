import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getToken } from "@/services/api";
import { AppShell } from "@/components/layout/AppShell";

export default function AuthGuard() {
  const location = useLocation();
  if (typeof window !== "undefined") {
    const token = getToken();
    if (!token) return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
