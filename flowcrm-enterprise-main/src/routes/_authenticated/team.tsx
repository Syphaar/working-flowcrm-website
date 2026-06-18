import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusPill } from "@/components/common/StatusPill";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Users, Plus, Pencil } from "lucide-react";
import { initials, relTime } from "@/lib/format";
import { toast } from "sonner";
import type { User, Role } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";

const DEFAULT_ROLES = ["super_admin", "manager", "sales_executive", "marketing"];
const DEPARTMENTS = ["Sales", "Marketing", "Engineering", "Support", "HR", "Finance", "Operations", "Legal"];

export default function TeamPage() {
  const { users, roles: backendRoles, upsert, bulkRemove, log } = useData();
  const { user, isAdmin, can, isHydrated } = useAuth();
  const nav = useNavigate();

  const roleOptions = useMemo(() => {
    const custom = backendRoles
      .filter((r) => !DEFAULT_ROLES.includes(r.name))
      .map((r) => r.name);
    return [...DEFAULT_ROLES, ...custom];
  }, [backendRoles]);

  useEffect(() => {
    document.title = "Team — FlowCRM";
  }, []);

  const [open, setOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<User | null>(null);
  const [form, setForm] = useState<any>({
    name: "",
    email: "",
    role: "sales_executive",
    department: "Sales",
  });

  const isEditing = !!editingMember;

  const resetForm = () => {
    setForm({ name: "", email: "", role: "sales_executive", department: "Sales" });
    setEditingMember(null);
    setOpen(false);
  };

  const openEdit = (member: User) => {
    setEditingMember(member);
    setForm({
      name: member.name,
      email: member.email,
      role: member.role,
      department: member.department,
    });
    setOpen(true);
  };

  if (!isHydrated)
    return (
      <div className="p-8 text-center text-muted-foreground">Loading...</div>
    );
  if (!can("manage_users"))
    return (
      <div className="p-8 text-center">
        <p>Access denied.</p>
        <Link to="/dashboard" className="text-primary">
          Back
        </Link>
      </div>
    );

  const cols: Column<User>[] = [
    {
      key: "name",
      header: "Member",
      sortable: true,
      render: (member) => (
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full gradient-primary text-white text-xs font-bold">
            {initials(member.name)}
          </div>
          <div>
            <div className="font-medium">{member.name}</div>
            <div className="text-xs text-muted-foreground">{member.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (member) => (
        <span className="capitalize">{member.role.replace("_", " ")}</span>
      ),
    },
    {
      key: "department",
      header: "Department",
      render: (member) => (
        <span>{member.department}</span>
      ),
    },
    { key: "status", header: "Presence", render: (member) => <StatusPill value={member.status} /> },
    {
      key: "lastActive",
      header: "Last Active",
      render: (member) => relTime(member.lastActive),
      accessor: (member) => member.lastActive,
      sortable: true,
    },
    ...(isAdmin
      ? [
          {
            key: "actions" as const,
            header: "" as const,
            render: (member: User) => (
              <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => openEdit(member)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            ),
          },
        ]
      : []),
  ];

  const save = () => {
    if (!user) return;
    if (isEditing && editingMember) {
      upsert("users", {
        ...editingMember,
        name: form.name,
        role: form.role as Role,
        department: form.department,
      });
      log({
        userId: user.id,
        userName: user.name,
        role: user.role,
        kind: "role_change",
        entity: "User",
        entityId: editingMember.id,
        description: `Updated ${form.name} details.`,
      });
      toast.success("Member updated");
    } else {
      const id = `u_${Date.now()}`;
      upsert("users", {
        id,
        name: form.name,
        email: form.email,
        password: "Demo123",
        phone: "",
        department: form.department,
        role: form.role as Role,
        roles: [form.role as Role],
        status: "offline",
        lastActive: new Date().toISOString(),
        lastLogin: "",
        lastLogout: "",
        createdAt: new Date().toISOString(),
      });
      log({
        userId: user.id,
        userName: user.name,
        role: user.role,
        kind: "create",
        entity: "User",
        entityId: id,
        description: `Invited ${form.name} (${form.role}).`,
      });
      toast.success("Member invited");
    }
    resetForm();
  };

  return (
    <div>
      <PageHeader
        title="Team"
        description="Manage members, roles, and access."
        icon={Users}
        actions={
          <Button size="sm" className="gradient-primary text-white" onClick={() => { setEditingMember(null); setForm({ name: "", email: "", role: "sales_executive", department: "Sales" }); setOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Invite Member
          </Button>
        }
      />
      <DataTable
        data={users}
        columns={cols}
        searchPlaceholder="Search members…"
        searchKeys={["name", "email", "role", "department"]}
        exportName="team"
        onRowClick={(member) => nav("/team/" + member.id)}
        bulkActions={[
          {
            label: "Remove",
            destructive: true,
            onClick: (ids) => {
              bulkRemove(
                "users",
                ids.filter((id) => id !== user?.id),
              );
              toast.success("Removed");
            },
          },
        ]}
      />
      <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Member" : "Invite Member"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            {!isEditing && (
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Role</Label>
                <Select
                  value={form.role}
                  onValueChange={(value) => setForm({ ...form, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((role) => (
                      <SelectItem key={role} value={role} className="capitalize">
                        {role.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Department</Label>
                <Select
                  value={form.department}
                  onValueChange={(value) => setForm({ ...form, department: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={save} className="gradient-primary text-white">
              {isEditing ? "Save" : "Invite"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
