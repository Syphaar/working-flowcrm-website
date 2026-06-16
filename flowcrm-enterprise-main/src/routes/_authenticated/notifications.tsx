import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/common/PageHeader";
import { Bell, Plus, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { relTime } from "@/lib/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const { notifications, users, upsert, remove, notify } = useData();
  const { user, isAdmin, can } = useAuth();
  const [searchParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({
    title: "",
    message: "",
    recipientId: "all",
    type: "info",
  });
  const [filter, setFilter] = useState<"all" | "unread" | "read">(() => {
    const param = searchParams.get("filter");
    if (param === "unread" || param === "read") return param;
    return "all";
  });
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    document.title = "Notifications — FlowCRM";
  }, []);

  const mine = notifications.filter((notification) => notification.recipientId === user?.id);
  const list = mine
    .filter(
      (notification) =>
        filter === "all" || (filter === "unread" ? !notification.read : notification.read),
    )
    .sort((notifA, notifB) => +new Date(notifB.createdAt) - +new Date(notifA.createdAt));
  const pageCount = Math.max(1, Math.ceil(list.length / pageSize));
  const slice = list.slice((page - 1) * pageSize, page * pageSize);

  const toggleRead = (id: string, read: boolean) => {
    const notification = notifications.find((item) => item.id === id);
    if (!notification) return;
    upsert("notifications", { ...notification, read });
  };
  const send = () => {
    const targets = form.recipientId === "all" ? users.map((user) => user.id) : [form.recipientId];
    targets.forEach((rid) =>
      notify({
        title: form.title,
        message: form.message,
        senderId: user!.id,
        senderName: user!.name,
        recipientId: rid,
        type: form.type,
      }),
    );
    toast.success(`Sent to ${targets.length} recipient(s)`);
    setOpen(false);
    setForm({ title: "", message: "", recipientId: "all", type: "info" });
  };

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Stay in the loop. Manage alerts and announcements."
        icon={Bell}
        actions={
          can("send_notifications") ? (
            <Button size="sm" className="gradient-primary text-white" onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Send
            </Button>
          ) : null
        }
      />
      <div className="mb-4 flex gap-2">
        {(["all", "unread", "read"] as const).map((filterValue) => (
          <Button
            key={filterValue}
            variant={filter === filterValue ? "default" : "outline"}
            size="sm"
            className="capitalize"
            onClick={() => {
              setFilter(filterValue);
              setPage(1);
            }}
          >
            {filterValue}
          </Button>
        ))}
      </div>
      <div className="space-y-2">
        {list.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No notifications
            </CardContent>
          </Card>
        )}
        {slice.map((notification) => (
          <Card
            key={notification.id}
            className={cn("shadow-soft", !notification.read && "border-l-4 border-l-primary")}
          >
            <CardContent className="p-4 flex items-start gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary">
                <Bell className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="font-semibold">{notification.title}</div>
                  <Badge variant="secondary" className="capitalize">
                    {notification.type}
                  </Badge>
                  {!notification.read && <Badge variant="default">New</Badge>}
                </div>
                <div className="text-sm text-muted-foreground mt-0.5">{notification.message}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  From {notification.senderName} · {relTime(notification.createdAt)}
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => toggleRead(notification.id, !notification.read)}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    remove("notifications", notification.id);
                    toast.success("Deleted");
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, list.length)} of{" "}
          {list.length}
        </span>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  setPage((page) => Math.max(1, page - 1));
                }}
              />
            </PaginationItem>
            {Array.from({ length: pageCount }, (_, index) => {
              const pageNum = Math.min(Math.max(1, page - 2), Math.max(1, pageCount - 4)) + index;
              if (pageNum > pageCount) return null;
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    href="#"
                    isActive={pageNum === page}
                    onClick={(event) => {
                      event.preventDefault();
                      setPage(pageNum);
                    }}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  setPage((page) => Math.min(pageCount, page + 1));
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Notification</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea
                rows={3}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Recipient</Label>
                <Select
                  value={form.recipientId}
                  onValueChange={(value) => setForm({ ...form, recipientId: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All users (broadcast)</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(value) => setForm({ ...form, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["info", "success", "warning", "danger"].map((type) => (
                      <SelectItem key={type} value={type} className="capitalize">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={send} className="gradient-primary text-white">
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
