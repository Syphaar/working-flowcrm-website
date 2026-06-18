import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/common/StatusPill";
import { fmtCurrency, fmtDate, initials } from "@/lib/format";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, UserPlus, Upload, ArrowRightCircle } from "lucide-react";
import type { Lead, LeadStage, LeadStatus } from "@/lib/types";
import Papa from "papaparse";

export default function LeadsPage() {
  const { user, isAdmin, can, isHydrated } = useAuth();
  const { leads, users, upsert, remove, bulkRemove, log, notify } = useData();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Leads — FlowCRM";
  }, []);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [stageFilter, setStageFilter] = useState<string>("all");
  const fileRef = useRef<HTMLInputElement>(null);

  const STAGES: LeadStage[] = [
    "New Lead",
    "Contacted",
    "Qualified",
    "Proposal Sent",
    "Negotiation",
    "Won",
    "Lost",
  ];
  const STATUSES: LeadStatus[] = ["Active", "Inactive", "Converted", "Lost"];

  const scoped = useMemo(() => {
    let xs = isAdmin ? leads : leads.filter((lead) => lead.ownerId === user?.id);
    if (stageFilter !== "all") xs = xs.filter((lead) => lead.stage === stageFilter);
    return xs;
  }, [leads, isAdmin, user?.id, stageFilter]);

  if (!isHydrated)
    return (
      <div className="p-8 text-center text-muted-foreground">Loading...</div>
    );
  if (!can("view_leads"))
    return (
      <div className="p-8 text-center">
        <p>Access denied.</p>
        <Link to="/dashboard" className="text-primary">Back</Link>
      </div>
    );

  const ownerName = (id: string) => users.find((user) => user.id === id)?.name ?? "—";

  const columns: Column<Lead>[] = [
    {
      key: "name",
      header: "Name",
      sortable: true,
      render: (lead) => (
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full gradient-primary text-white text-xs font-bold">
            {initials(lead.name)}
          </div>
          <div className="min-w-0">
            <div className="font-medium truncate">{lead.name}</div>
            <div className="text-xs text-muted-foreground truncate">{lead.email}</div>
          </div>
        </div>
      ),
    },
    { key: "company", header: "Company", sortable: true },
    {
      key: "stage",
      header: "Stage",
      sortable: true,
      render: (lead) => <StatusPill value={lead.stage} />,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (lead) => <StatusPill value={lead.status} />,
    },
    {
      key: "value",
      header: "Value",
      sortable: true,
      render: (lead) => <span className="font-medium">{fmtCurrency(lead.value)}</span>,
      accessor: (lead) => lead.value,
    },
    { key: "source", header: "Source" },
    {
      key: "ownerId",
      header: "Owner",
      render: (lead) => ownerName(lead.ownerId),
      accessor: (lead) => ownerName(lead.ownerId),
    },
    {
      key: "updatedAt",
      header: "Updated",
      sortable: true,
      render: (lead) => fmtDate(lead.updatedAt),
      accessor: (lead) => lead.updatedAt,
    },
    {
      key: "actions",
      header: "",
      render: (lead) => (
        <div className="flex justify-end gap-1">
          {can("edit_leads") && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(event) => {
                event.stopPropagation();
                setEditing(lead);
                setOpen(true);
              }}
            >
              Edit
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={(event) => {
              event.stopPropagation();
              convert(lead);
            }}
          >
            <ArrowRightCircle className="h-4 w-4" />
          </Button>
          {can("delete_leads") && (
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive"
              onClick={(event) => {
                event.stopPropagation();
                del(lead);
              }}
            >
              Delete
            </Button>
          )}
        </div>
      ),
      className: "text-right",
    },
  ];

  const save = (data: Partial<Lead>) => {
    if (!user) return;
    const isNew = !editing;
    const id = editing?.id ?? `ld_${Date.now()}`;
    const next: Lead = {
      id,
      name: data.name || "Untitled",
      company: data.company || "",
      email: data.email || "",
      phone: data.phone || "",
      source: data.source || "Website",
      stage: (data.stage as LeadStage) || "New Lead",
      status: (data.status as LeadStatus) || "Active",
      ownerId: data.ownerId || user.id,
      value: Number(data.value) || 0,
      notes: data.notes || "",
      tags: editing?.tags || [],
      createdAt: editing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    upsert("leads", next);
    log({
      userId: user.id,
      userName: user.name,
      role: user.role,
      kind: isNew ? "create" : "update",
      entity: "Lead",
      entityId: id,
      description: `${user.name} ${isNew ? "created" : "updated"} lead "${next.name}".`,
    });
    toast.success(isNew ? "Lead created" : "Lead updated");
    setOpen(false);
    setEditing(null);
  };

  const del = (lead: Lead) => {
    remove("leads", lead.id);
    log({
      userId: user!.id,
      userName: user!.name,
      role: user!.role,
      kind: "delete",
      entity: "Lead",
      entityId: lead.id,
      description: `Deleted lead "${lead.name}".`,
    });
    toast.success("Lead deleted");
  };

  const convert = (lead: Lead) => {
    if (!user) return;
    const cId = `ct_${Date.now()}`;
    upsert("contacts", {
      id: cId,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      title: "Lead",
      ownerId: lead.ownerId,
      tags: lead.tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    const cuId = `cu_${Date.now() + 1}`;
    upsert("customers", {
      id: cuId,
      name: lead.name,
      company: lead.company,
      email: lead.email,
      phone: lead.phone,
      status: "Active",
      totalSpend: 0,
      ownerId: lead.ownerId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    upsert("leads", { ...lead, status: "Converted" });
    log({
      userId: user.id,
      userName: user.name,
      role: user.role,
      kind: "convert",
      entity: "Lead",
      entityId: lead.id,
      description: `Converted lead "${lead.name}" to customer.`,
    });
    notify({
      title: "Lead converted",
      message: `${lead.name} is now a customer.`,
      senderId: user.id,
      senderName: user.name,
      recipientId: lead.ownerId,
      type: "success",
    });
    toast.success("Lead converted to customer");
  };

  const onImportFile = (file: File) => {
    Papa.parse<any>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        let count = 0;
        res.data.forEach((row: any, index: number) => {
          if (!row.name && !row.Name) return;
          const id = `ld_${Date.now()}_${index}`;
          const lead: Lead = {
            id,
            name: row.name || row.Name || "Untitled",
            company: row.company || row.Company || "",
            email: row.email || row.Email || "",
            phone: row.phone || row.Phone || "",
            source: row.source || row.Source || "CSV Import",
            stage: (row.stage || row.Stage || "New Lead") as LeadStage,
            status: "Active",
            ownerId: user!.id,
            value: Number(row.value || row.Value || 0),
            notes: "",
            tags: ["imported"],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          upsert("leads", lead);
          count++;
        });
        log({
          userId: user!.id,
          userName: user!.name,
          role: user!.role,
          kind: "import",
          description: `Imported ${count} leads from CSV.`,
        });
        toast.success(`Imported ${count} leads`);
        setImportOpen(false);
      },
      error: (err) => toast.error("Import failed: " + err.message),
    });
  };

  return (
    <div>
      <PageHeader
        title="Leads"
        description="Pipeline-ready prospects, captured and tracked."
        icon={UserPlus}
        actions={
          <>
            {can("edit_leads") && (
              <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
                <Upload className="mr-2 h-4 w-4" /> Import CSV
              </Button>
            )}
            {can("edit_leads") && (
              <Button
                size="sm"
                className="gradient-primary text-white"
                onClick={() => {
                  setEditing(null);
                  setOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> New Lead
              </Button>
            )}
          </>
        }
      />

      <DataTable
        data={scoped}
        columns={columns}
        searchPlaceholder="Search leads, companies, emails, stage…"
        searchKeys={["name", "company", "email", "phone", "stage", "status", "source"]}
        exportName="leads"
        emptyTitle="No leads yet"
        emptyDescription="Capture your first lead to start building pipeline."
        onRowClick={(lead) => navigate("/leads/" + lead.id)}
        filters={
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Stage" />
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
        }
        bulkActions={[
          ...(can("delete_leads")
            ? [
                {
                  label: "Delete" as const,
                  destructive: true as const,
                  onClick: (ids: string[]) => {
                    bulkRemove("leads", ids);
                    log({
                      userId: user!.id,
                      userName: user!.name,
                      role: user!.role,
                      kind: "delete",
                      description: `Bulk deleted ${ids.length} leads.`,
                    });
                    toast.success(`${ids.length} leads deleted`);
                  },
                },
              ]
            : []),
          {
            label: "Mark Active",
            onClick: (ids) => {
              ids.forEach((id) => {
                const lead = leads.find((item) => item.id === id);
                if (lead) upsert("leads", { ...lead, status: "Active" });
              });
              toast.success("Updated");
            },
          },
        ]}
      />

      <LeadDialog
        open={open}
        onOpenChange={setOpen}
        initial={editing}
        onSave={save}
        users={users}
      />

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Leads from CSV</DialogTitle>
            <DialogDescription>
              Upload a CSV with columns: name, company, email, phone, source, stage, value.
            </DialogDescription>
          </DialogHeader>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && onImportFile(e.target.files[0])}
          />
          <div className="rounded-xl border-2 border-dashed p-8 text-center">
            <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm">Drop your CSV here or</p>
            <Button className="mt-3" onClick={() => fileRef.current?.click()}>
              Choose file
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LeadDialog({ open, onOpenChange, initial, onSave, users }: any) {
  const defaults = {
    name: "",
    company: "",
    email: "",
    phone: "",
    source: "Website",
    stage: "New Lead",
    status: "Active",
    value: 0,
    notes: "",
  };
  const [form, setForm] = useState<any>({ ...defaults, ...initial });
  useMemo(() => setForm({ ...defaults, ...initial }), [initial, open]);
  const set = (field: string, value: any) => setForm((prev: any) => ({ ...prev, [field]: value }));
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Lead" : "New Lead"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label>Name</Label>
            <Input value={form.name} onChange={(event) => set("name", event.target.value)} />
          </div>
          <div>
            <Label>Company</Label>
            <Input value={form.company} onChange={(event) => set("company", event.target.value)} />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(event) => set("email", event.target.value)}
            />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={form.phone} onChange={(event) => set("phone", event.target.value)} />
          </div>
          <div>
            <Label>Source</Label>
            <Select value={form.source} onValueChange={(value) => set("source", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  "Website",
                  "Referral",
                  "LinkedIn",
                  "Cold Email",
                  "Event",
                  "Partner",
                  "Ad Campaign",
                  "Webinar",
                ].map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {stage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Stage</Label>
            <Select value={form.stage} onValueChange={(value) => set("stage", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  "New Lead",
                  "Contacted",
                  "Qualified",
                  "Proposal Sent",
                  "Negotiation",
                  "Won",
                  "Lost",
                ].map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {stage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(value) => set("status", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Active", "Inactive", "Converted", "Lost"].map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Owner</Label>
            <Select value={form.ownerId} onValueChange={(value) => set("ownerId", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Assign owner" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user: any) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Value ($)</Label>
            <Input
              type="number"
              value={form.value}
              onChange={(event) => set("value", event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Notes</Label>
            <Textarea
              rows={3}
              value={form.notes}
              onChange={(event) => set("notes", event.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onSave(form)} className="gradient-primary text-white">
            {initial ? "Save" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
