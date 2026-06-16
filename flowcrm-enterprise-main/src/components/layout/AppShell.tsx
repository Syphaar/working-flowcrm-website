import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { BottomNav } from "./BottomNav";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <div className={cn("hidden md:block h-full transition-all", sidebarOpen ? "" : "md:hidden")}>
        <Sidebar />
      </div>
      <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden">
        <Topbar onToggleSidebar={() => setSidebarOpen((open) => !open)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}
