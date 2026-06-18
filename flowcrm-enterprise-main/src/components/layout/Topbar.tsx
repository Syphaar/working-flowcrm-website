import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, LogOut, Menu, Moon, Search, Sun, Monitor, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useData } from "@/context/DataContext";
import { Badge } from "@/components/ui/badge";
import { relTime } from "@/lib/format";
import { CommandPalette } from "./CommandPalette";
import { LogoutDialog } from "./LogoutDialog";

export function Topbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { notifications } = useData();
  const navigate = useNavigate();
  const [cmdOpen, setCmdOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const unread = notifications.filter(
    (notification) => notification.recipientId === user?.id && !notification.read,
  ).length;
  const myNotifs = useMemo(
    () =>
      notifications
        .filter((notification) => notification.recipientId === user?.id && !notification.read)
        .slice(0, 5),
    [notifications, user?.id],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCmdOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-3 backdrop-blur md:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden hover:bg-[#5D52E5] hover:text-white">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <Sidebar onNavigate={() => {}} />
          </SheetContent>
        </Sheet>
        <Button variant="ghost" size="icon" className="hidden md:flex hover:bg-[#5D52E5] hover:text-white" onClick={onToggleSidebar}>
          <Menu className="h-5 w-5" />
        </Button>
        <button
          onClick={() => setCmdOpen(true)}
          className="relative flex-1 max-w-xl flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2 text-sm text-muted-foreground hover:bg-muted/80 transition-colors cursor-text"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">Search leads, deals, customers…</span>
          <kbd className="hidden md:inline-flex items-center rounded border bg-background px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            ⌘K
          </kbd>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-[#5D52E5] hover:text-white">
              {theme === "dark" ? (
                <Moon className="h-4 w-4" />
              ) : theme === "light" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Monitor className="h-4 w-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="focus:bg-sidebar-accent focus:text-sidebar-accent-foreground" onClick={() => setTheme("light")}>
              <Sun className="mr-2 h-4 w-4" /> Light
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-sidebar-accent focus:text-sidebar-accent-foreground" onClick={() => setTheme("dark")}>
              <Moon className="mr-2 h-4 w-4" /> Dark
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-sidebar-accent focus:text-sidebar-accent-foreground" onClick={() => setTheme("system")}>
              <Monitor className="mr-2 h-4 w-4" /> System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative hover:bg-[#5D52E5] hover:text-white">
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                  {unread}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              Notifications <Badge variant="secondary">{unread} new</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {myNotifs.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">All caught up</div>
            )}
            {myNotifs.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex-col items-start py-2 focus:bg-sidebar-accent focus:text-sidebar-accent-foreground"
                onClick={() => navigate("/notifications")}
              >
                <div className="font-medium text-sm">{notification.title}</div>
                <div className="text-xs text-muted-foreground line-clamp-1">
                  {notification.message}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">
                  {relTime(notification.createdAt)}
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            {unread > 5 && (
              <DropdownMenuItem
                className="focus:bg-sidebar-accent focus:text-sidebar-accent-foreground"
                onClick={() => navigate("/notifications?filter=unread")}
              >
                More ({unread})
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="focus:bg-sidebar-accent focus:text-sidebar-accent-foreground"
              onClick={() => navigate("/notifications")}
            >
              View all
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full p-1 hover:bg-muted">
              <div className="grid h-8 w-8 place-items-center rounded-full gradient-primary text-white text-xs font-semibold">
                {user?.name
                  .split(" ")
                  .map((segment) => segment[0])
                  .slice(0, 2)
                  .join("")}
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="font-semibold">{user?.name}</div>
              <div className="text-xs text-muted-foreground">{user?.email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="focus:bg-sidebar-accent focus:text-sidebar-accent-foreground" onSelect={() => navigate("/settings")}>
              <UserIcon className="mr-2 h-4 w-4" /> Profile & Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setLogoutOpen(true)}
              className="text-destructive focus:text-destructive focus:bg-sidebar-accent"
            >
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
      <LogoutDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        onConfirm={() => {
          logout();
          navigate("/auth/login");
        }}
      />
    </>
  );
}
