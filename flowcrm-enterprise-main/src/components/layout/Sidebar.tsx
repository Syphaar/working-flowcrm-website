import { Link, useLocation } from "react-router-dom";
import { NAV } from "@/lib/nav";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { can, isAdmin, user } = useAuth();
  const path = useLocation().pathname;
  const items = NAV.filter(
    (navItem) => (navItem.adminOnly ? isAdmin : true) && (navItem.perm ? can(navItem.perm) : true),
  );
  const groups: Record<string, typeof items> = {};
  items.forEach((navItem) => {
    (groups[navItem.group] ||= []).push(navItem);
  });

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center gap-2 px-5 border-b">
        <div className="grid h-9 w-9 place-items-center rounded-xl gradient-primary text-white shadow-elevated">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold tracking-tight">FlowCRM</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Enterprise
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {Object.entries(groups).map(([group, list]) => (
          <div key={group}>
            <div className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {group}
            </div>
            <div className="space-y-0.5">
              {list.map((navItem) => {
                const active = path === navItem.to || path.startsWith(navItem.to + "/");
                const Icon = navItem.icon;
                return (
                  <Link
                    key={navItem.to}
                    to={navItem.to}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                    )}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0", active && "text-primary")} />
                    <span className="truncate">{navItem.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t p-3">
        <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/60 p-2.5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full gradient-primary text-white text-xs font-semibold">
            {user?.name
              .split(" ")
              .map((segment) => segment[0])
              .slice(0, 2)
              .join("")}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{user?.name}</div>
            <div className="truncate text-[11px] text-muted-foreground capitalize">
              {user?.role.replace("_", " ")}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
