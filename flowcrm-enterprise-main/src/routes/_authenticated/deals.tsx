import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusPill } from "@/components/common/StatusPill";
import { Briefcase, Plus, Search } from "lucide-react";
import { fmtCurrency, fmtDate } from "@/lib/format";
import { toast } from "sonner";
import type { Deal, LeadStage } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const STAGES: LeadStage[] = [
  "New Lead",
  "Contacted",
  "Qualified",
  "Proposal Sent",
  "Negotiation",
  "Won",
  "Lost",
];

export default function DealsPage() {
  const { deals, customers, upsert, bulkRemove, log } = useData();
  const { user, isAdmin, can } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    document.title = "Deals — FlowCRM";
  }, []);

  const [stage, setStage] = useState("all");
  const [secondary, setSecondary] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({
    name: "",
    customerName: "",
    value: 0,
    stage: "New Lead",
    probability: 50,
  });

  if (!can("manage_deals"))
    return (
      <div className="p-8 text-center">
        <p>Access denied.</p>
        <Link to="/dashboard" className="text-primary">Back</Link>
      </div>
    );

  const base = isAdmin ? deals : deals.filter((deal) => deal.ownerId === user?.id);
  const filtered = useMemo(
    () =>
      base.filter(
        (deal) =>
          (stage === "all" || deal.stage === stage) &&
          (!secondary ||
            (deal.stage + deal.status + fmtDate(deal.closeDate))
              .toLowerCase()
              .includes(secondary.toLowerCase())),
      ),
    [base, stage, secondary],
  );

  const cols: Column<Deal>[] = [
    {
      key: "name",
      header: "Deal",
      sortable: true,
      render: (deal) => (
        <div>
          <div className="font-medium">{deal.name}</div>
          <div className="text-xs text-muted-foreground">{deal.customerName}</div>
        </div>
      ),
    },
    { key: "stage", header: "Stage", render: (deal) => <StatusPill value={deal.stage} /> },
    { key: "status", header: "Status", render: (deal) => <StatusPill value={deal.status} /> },
    {
      key: "value",
      header: "Value",
      sortable: true,
      render: (deal) => <span className="font-medium">{fmtCurrency(deal.value)}</span>,
      accessor: (deal) => deal.value,
    },
    {
      key: "probability",
      header: "Win %",
      sortable: true,
      render: (deal) => `${deal.probability}%`,
      accessor: (deal) => deal.probability,
    },
    {
      key: "closeDate",
      header: "Close",
      sortable: true,
      render: (deal) => fmtDate(deal.closeDate),
      accessor: (deal) => deal.closeDate,
    },
  ];

  const save = () => {
    if (!user) return;
    const id = `dl_${Date.now()}`;
    upsert("deals", {
      ...form,
      id,
      status: "Open",
      ownerId: user.id,
      value: Number(form.value),
      probability: Number(form.probability),
      closeDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Deal);
    log({
      userId: user.id,
      userName: user.name,
      role: user.role,
      kind: "create",
      entity: "Deal",
      entityId: id,
      description: `Created deal ${form.name}`,
    });
    toast.success("Deal created");
    setOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Deals"
        description="Track every opportunity to close."
        icon={Briefcase}
        actions={
          <Button size="sm" className="gradient-primary text-white" onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Deal
          </Button>
        }
      />
      <DataTable
        data={filtered}
        columns={cols}
        searchPlaceholder="Search deals, customers…"
        searchKeys={["name", "customerName", "stage", "status"]}
        exportName="deals"
        onRowClick={(deal) => nav("/deals/" + deal.id)}
        filters={
          <>
            <Select value={stage} onValueChange={setStage}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All stages</SelectItem>
                {STAGES.map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {stage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={secondary}
                onChange={(e) => setSecondary(e.target.value)}
                placeholder="Stage, status, date"
                className="pl-9 w-44"
              />
            </div>
          </>
        }
        bulkActions={[
          {
            label: "Delete",
            destructive: true,
            onClick: (ids) => {
              bulkRemove("deals", ids);
              toast.success("Deleted");
            },
          },
        ]}
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Deal</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Deal name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <Label>Customer</Label>
              <Select
                value={form.customerName}
                onValueChange={(value) => setForm({ ...form, customerName: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.slice(0, 30).map((customer) => (
                    <SelectItem key={customer.id} value={customer.name}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Value</Label>
              <Input
                type="number"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
              />
            </div>
            <div>
              <Label>Win %</Label>
              <Input
                type="number"
                value={form.probability}
                onChange={(e) => setForm({ ...form, probability: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <Label>Stage</Label>
              <Select
                value={form.stage}
                onValueChange={(value) => setForm({ ...form, stage: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGES.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {stage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} className="gradient-primary text-white">
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
