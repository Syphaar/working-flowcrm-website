import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, KanbanSquare, Bell, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/leads", label: "Leads", icon: Users },
  { to: "/pipeline", label: "Pipeline", icon: KanbanSquare },
  { to: "/tasks", label: "Tasks", icon: ListChecks },
  { to: "/notifications", label: "Alerts", icon: Bell },
];

export function BottomNav() {
  const path = useLocation().pathname;
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 grid grid-cols-5 border-t bg-background/95 backdrop-blur md:hidden">
      {items.map((item) => {
        const active = path.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex flex-col items-center gap-1 py-2 text-[10px] font-medium",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
