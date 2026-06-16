import React, { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { DataProvider } from "@/context/DataContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Toaster } from "@/components/ui/sonner";
import { AppShell } from "@/components/layout/AppShell";
import { getToken } from "@/services/api";

import LoginPage from "@/routes/auth/login";
import RegisterPage from "@/routes/auth/register";
import ForgotPasswordPage from "@/routes/auth/forgot-password";
import UnauthorizedPage from "@/routes/auth/unauthorized";
import DashboardPage from "@/routes/_authenticated/dashboard";
import LeadsPage from "@/routes/_authenticated/leads";
import LeadDetail from "@/routes/_authenticated/leads.$id";
import DealsPage from "@/routes/_authenticated/deals";
import DealDetail from "@/routes/_authenticated/deals.$id";
import ContactsPage from "@/routes/_authenticated/contacts";
import ContactDetail from "@/routes/_authenticated/contacts.$id";
import CompaniesPage from "@/routes/_authenticated/companies";
import CompanyDetail from "@/routes/_authenticated/companies.$id";
import CustomersPage from "@/routes/_authenticated/customers";
import CustomerDetail from "@/routes/_authenticated/customers.$id";
import TeamPage from "@/routes/_authenticated/team";
import TeamMemberDetail from "@/routes/_authenticated/team.$id";
import TasksPage from "@/routes/_authenticated/tasks";
import SettingsPage from "@/routes/_authenticated/settings";
import RolesPage from "@/routes/_authenticated/roles";
import ReportsPage from "@/routes/_authenticated/reports";
import PipelinePage from "@/routes/_authenticated/pipeline";
import NotificationsPage from "@/routes/_authenticated/notifications";
import ActivitiesPage from "@/routes/_authenticated/activities";
import CalendarPage from "@/routes/_authenticated/calendar";
import CommunicationsPage from "@/routes/_authenticated/communications";
import AuditPage from "@/routes/_authenticated/audit";

function IndexRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    const token = getToken();
    navigate(token ? "/dashboard" : "/auth/login", { replace: true });
  }, [navigate]);
  return null;
}

function AuthGuard() {
  const location = useLocation();
  const token = getToken();
  if (!token) return <Navigate to="/auth/login" state={{ from: location }} replace />;
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <p className="mt-4 text-sm text-muted-foreground">Page not found.</p>
        <a
          href="/dashboard"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Go home
        </a>
      </div>
    </div>
  );
}

function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => reset()}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Try again
          </button>
          <a href="/dashboard" className="rounded-md border px-4 py-2 text-sm font-medium">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return <GlobalError error={this.state.error} reset={() => this.setState({ error: null })} />;
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter
        future={{
          v7_startTransition: false,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider>
          <DataProvider>
            <ThemeProvider>
              <Routes>
                <Route path="/" element={<IndexRedirect />} />
                <Route path="/auth/login" element={<LoginPage />} />
                <Route path="/auth/register" element={<RegisterPage />} />
                <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/auth/unauthorized" element={<UnauthorizedPage />} />
                <Route element={<AuthGuard />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/leads" element={<LeadsPage />} />
                  <Route path="/leads/:id" element={<LeadDetail />} />
                  <Route path="/deals" element={<DealsPage />} />
                  <Route path="/deals/:id" element={<DealDetail />} />
                  <Route path="/contacts" element={<ContactsPage />} />
                  <Route path="/contacts/:id" element={<ContactDetail />} />
                  <Route path="/companies" element={<CompaniesPage />} />
                  <Route path="/companies/:id" element={<CompanyDetail />} />
                  <Route path="/customers" element={<CustomersPage />} />
                  <Route path="/customers/:id" element={<CustomerDetail />} />
                  <Route path="/team" element={<TeamPage />} />
                  <Route path="/team/:id" element={<TeamMemberDetail />} />
                  <Route path="/tasks" element={<TasksPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/roles" element={<RolesPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/pipeline" element={<PipelinePage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/activities" element={<ActivitiesPage />} />
                  <Route path="/calendar" element={<CalendarPage />} />
                  <Route path="/communications" element={<CommunicationsPage />} />
                  <Route path="/audit" element={<AuditPage />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster position="top-right" richColors closeButton />
            </ThemeProvider>
          </DataProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
