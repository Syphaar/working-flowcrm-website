import { useEffect, useState } from "react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { MessageSquare, Mail, Phone, Send, Plus, Trash2 } from "lucide-react";
import { fmtDateTime, initials } from "@/lib/format";
import { toast } from "sonner";

export default function CommunicationsPage() {
  const { communications, users, upsert, log, bulkRemove } = useData();
  const { user, isAdmin } = useAuth();
  const [tab, setTab] = useState<"all" | "email" | "call" | "sms" | "internal">("all");
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [form, setForm] = useState<any>({ channel: "email", toId: "", subject: "", body: "" });

  useEffect(() => {
    document.title = "Communications — FlowCRM";
  }, []);

  const list = communications
    .filter((comm) => tab === "all" || comm.channel === tab)
    .sort((commA, commB) => +new Date(commB.createdAt) - +new Date(commA.createdAt));
  const pageCount = Math.max(1, Math.ceil(list.length / pageSize));
  const slice = list.slice((page - 1) * pageSize, page * pageSize);
  const send = () => {
    const to = users.find((user) => user.id === form.toId);
    if (!to || !user) return;
    const id = `cm_${Date.now()}`;
    upsert("communications", {
      id,
      channel: form.channel,
      fromId: user.id,
      fromName: user.name,
      toId: to.id,
      toName: to.name,
      subject: form.subject,
      body: form.body,
      createdAt: new Date().toISOString(),
    });
    log({
      userId: user.id,
      userName: user.name,
      role: user.role,
      kind: "notification",
      description: `Sent ${form.channel} to ${to.name}.`,
    });
    toast.success("Message sent");
    setOpen(false);
    setForm({ channel: "email", toId: "", subject: "", body: "" });
  };

  const icon = (channel: string) =>
    channel === "email" ? Mail : channel === "call" ? Phone : MessageSquare;

  return (
    <div>
      <PageHeader
        title="Communication Center"
        description="Emails, calls, SMS, and internal messages in one stream."
        icon={MessageSquare}
        actions={
          <Button size="sm" className="gradient-primary text-white" onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Compose
          </Button>
        }
      />
      <Tabs
        value={tab}
        onValueChange={(value) => {
          setTab(value as any);
          setPage(1);
        }}
        className="mb-4"
      >
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="call">Calls</TabsTrigger>
          <TabsTrigger value="sms">SMS</TabsTrigger>
          <TabsTrigger value="internal">Internal</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="space-y-2">
        {slice.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No communications
            </CardContent>
          </Card>
        )}
        {slice.map((comm) => {
          const Ic = icon(comm.channel);
          return (
            <Card key={comm.id} className="shadow-soft">
              <CardContent className="p-4 flex items-start gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary">
                  <Ic className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm">
                      <span className="font-semibold">{comm.fromName}</span> → {comm.toName}
                    </div>
                    <div className="flex items-center gap-2">
                      {isAdmin && (
                        <button
                          onClick={() => {
                            bulkRemove("communications", [comm.id]);
                            toast.success("Communication deleted");
                          }}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {fmtDateTime(comm.createdAt)}
                      </div>
                    </div>
                  </div>
                  {comm.subject && <div className="text-sm font-medium mt-0.5">{comm.subject}</div>}
                  <div className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                    {comm.body}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
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
            <DialogTitle>Compose Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Channel</Label>
                <Select
                  value={form.channel}
                  onValueChange={(value) => setForm({ ...form, channel: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["email", "call", "sms", "internal"].map((channel) => (
                      <SelectItem key={channel} value={channel} className="capitalize">
                        {channel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>To</Label>
                <Select
                  value={form.toId}
                  onValueChange={(value) => setForm({ ...form, toId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipient" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Subject</Label>
              <Input
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea
                rows={5}
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={send} className="gradient-primary text-white">
              <Send className="mr-2 h-4 w-4" /> Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
