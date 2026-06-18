import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusPill } from "@/components/common/StatusPill";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Plus, ArrowLeft, Pencil } from "lucide-react";
import { fmtCurrency, fmtDate, fmtNumber } from "@/lib/format";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { toast } from "sonner";
import type { Company } from "@/lib/types";

export default function CompaniesPage() {
  const { companies, upsert, bulkRemove, log } = useData();
  const { user, can, isAdmin, isHydrated } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    document.title = "Companies — FlowCRM";
  }, []);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [form, setForm] = useState<any>({
    name: "",
    industry: "Software",
    website: "",
    address: "",
    revenue: 0,
    employees: 0,
    status: "Prospect",
  });

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

  const cols: Column<Company>[] = [
    {
      key: "name",
      header: "Company",
      sortable: true,
      render: (company) => (
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <div className="font-medium">{company.name}</div>
            <div className="text-xs text-muted-foreground">{company.website}</div>
          </div>
        </div>
      ),
    },
    { key: "industry", header: "Industry", sortable: true },
    {
      key: "employees",
      header: "Employees",
      sortable: true,
      render: (company) => fmtNumber(company.employees),
      accessor: (company) => company.employees,
    },
    {
      key: "revenue",
      header: "Revenue",
      sortable: true,
      render: (company) => fmtCurrency(company.revenue),
      accessor: (company) => company.revenue,
    },
    { key: "status", header: "Status", render: (company) => <StatusPill value={company.status} /> },
    {
      key: "updatedAt",
      header: "Updated",
      sortable: true,
      render: (company) => fmtDate(company.updatedAt),
      accessor: (company) => company.updatedAt,
    },
    ...(isAdmin
      ? [
          {
            key: "actions" as const,
            header: "",
            render: (company: Company) => (
              <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditing(company);
                    setForm({
                      name: company.name,
                      industry: company.industry,
                      website: company.website,
                      address: company.address,
                      revenue: company.revenue,
                      employees: company.employees,
                      status: company.status,
                    });
                    setOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            ),
            className: "text-right",
          },
        ]
      : []),
  ];

  const save = () => {
    if (!user) return;
    if (editing) {
      upsert("companies", {
        ...editing,
        ...form,
        updatedAt: new Date().toISOString(),
      } as Company);
      log({
        userId: user.id,
        userName: user.name,
        role: user.role,
        kind: "update",
        entity: "Company",
        entityId: editing.id,
        description: `Updated company ${form.name}`,
      });
      toast.success("Company updated");
    } else {
      const id = `co_${Date.now()}`;
      upsert("companies", {
        ...form,
        id,
        status: "Prospect",
        ownerId: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Company);
      log({
        userId: user.id,
        userName: user.name,
        role: user.role,
        kind: "create",
        entity: "Company",
        entityId: id,
        description: `Created company ${form.name}`,
      });
      toast.success("Company created");
    }
    setOpen(false);
    setEditing(null);
  };

  return (
    <div>
      <PageHeader
        title="Companies"
        description="Accounts and organizations in your CRM."
        icon={Building2}
        actions={
          <Button size="sm" className="gradient-primary text-white" onClick={() => { setEditing(null); setForm({ name: "", industry: "Software", website: "", address: "", revenue: 0, employees: 0, status: "Prospect" }); setOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> New Company
          </Button>
        }
      />
      <DataTable
        data={companies}
        columns={cols}
        searchPlaceholder="Search companies, industries…"
        searchKeys={["name", "industry", "website", "address"]}
        exportName="companies"
        onRowClick={(company) => nav("/companies/" + company.id)}
        bulkActions={[
          {
            label: "Delete",
            destructive: true,
            onClick: (ids) => {
              bulkRemove("companies", ids);
              toast.success("Deleted");
            },
          },
        ]}
      />
      <Dialog open={open} onOpenChange={(v) => { if (!v) { setOpen(false); setEditing(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Company" : "New Company"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            {[
              ["name", "Name"],
              ["industry", "Industry"],
              ["website", "Website"],
              ["address", "Address"],
              ["revenue", "Revenue"],
              ["employees", "Employees"],
            ].map(([field, label]) => (
              <div key={field}>
                <Label>{label}</Label>
                <Input
                  value={form[field]}
                  type={field === "revenue" || field === "employees" ? "number" : "text"}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      [field]:
                        field === "revenue" || field === "employees"
                          ? Number(e.target.value)
                          : e.target.value,
                    })
                  }
                />
              </div>
            ))}
            <div>
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) => setForm({ ...form, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["Active", "Prospect", "Inactive"] as const).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setOpen(false); setEditing(null); }}>
              Cancel
            </Button>
            <Button onClick={save} className="gradient-primary text-white">
              {editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
