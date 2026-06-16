import { Outlet } from "react-router-dom";
import { DataProvider } from "@/context/DataContext";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout() {
  return (
    <DataProvider>
      <AuthProvider>
        <ThemeProvider>
          <Outlet />
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </AuthProvider>
    </DataProvider>
  );
}
