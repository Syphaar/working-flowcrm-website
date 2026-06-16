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
import { UsersRound, Plus, Search } from "lucide-react";
import { fmtCurrency, fmtDate, initials } from "@/lib/format";
import { toast } from "sonner";
import type { Customer } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function CustomersPage() {
  const { customers, upsert, bulkRemove, log } = useData();
  const { user, isAdmin, can } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    document.title = "Customers — FlowCRM";
  }, []);

  const [status, setStatus] = useState("all");
  const [secondary, setSecondary] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ name: "", company: "", email: "", phone: "" });

  if (!can("manage_customers"))
    return (
      <div className="p-8 text-center">
        <p>Access denied.</p>
        <Link to="/dashboard" className="text-primary">Back</Link>
      </div>
    );

  const base = isAdmin ? customers : customers.filter((customer) => customer.ownerId === user?.id);
  const filtered = useMemo(
    () =>
      base.filter(
        (customer) =>
          (status === "all" || customer.status === status) &&
          (!secondary ||
            (customer.status + fmtDate(customer.updatedAt))
              .toLowerCase()
              .includes(secondary.toLowerCase())),
      ),
    [base, status, secondary],
  );

  const cols: Column<Customer>[] = [
    {
      key: "name",
      header: "Customer",
      sortable: true,
      render: (customer) => (
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full gradient-secondary text-white text-xs font-bold">
            {initials(customer.name)}
          </div>
          <div>
            <div className="font-medium">{customer.name}</div>
            <div className="text-xs text-muted-foreground">{customer.email}</div>
          </div>
        </div>
      ),
    },
    { key: "company", header: "Company", sortable: true },
    {
      key: "status",
      header: "Status",
      render: (customer) => <StatusPill value={customer.status} />,
    },
    {
      key: "totalSpend",
      header: "Total Spend",
      sortable: true,
      render: (customer) => fmtCurrency(customer.totalSpend),
      accessor: (customer) => customer.totalSpend,
    },
    {
      key: "updatedAt",
      header: "Updated",
      sortable: true,
      render: (customer) => fmtDate(customer.updatedAt),
      accessor: (customer) => customer.updatedAt,
    },
  ];

  const save = () => {
    if (!user) return;
    const id = `cu_${Date.now()}`;
    upsert("customers", {
      ...form,
      id,
      status: "Active",
      totalSpend: 0,
      ownerId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Customer);
    log({
      userId: user.id,
      userName: user.name,
      role: user.role,
      kind: "create",
      entity: "Customer",
      entityId: id,
      description: `Created customer ${form.name}`,
    });
    toast.success("Customer created");
    setOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Customers"
        description="Active accounts driving revenue."
        icon={UsersRound}
        actions={
          <Button size="sm" className="gradient-primary text-white" onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Customer
          </Button>
        }
      />
      <DataTable
        data={filtered}
        columns={cols}
        searchPlaceholder="Search by name or company…"
        searchKeys={["name", "company", "email"]}
        exportName="customers"
        onRowClick={(customer) => nav("/customers/" + customer.id)}
        filters={
          <>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                {["Active", "VIP", "At Risk", "Churned"].map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={secondary}
                onChange={(e) => setSecondary(e.target.value)}
                placeholder="Status, date…"
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
              bulkRemove("customers", ids);
              toast.success("Deleted");
            },
          },
        ]}
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Customer</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            {["name", "company", "email", "phone"].map((field) => (
              <div key={field} className={field === "name" ? "col-span-2" : ""}>
                <Label className="capitalize">{field}</Label>
                <Input
                  value={form[field]}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                />
              </div>
            ))}
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
