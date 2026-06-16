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

export default function TeamPage() {
  const { users, roles: backendRoles, upsert, bulkRemove, log } = useData();
  const { user, can } = useAuth();
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
  const [form, setForm] = useState<any>({
    name: "",
    email: "",
    role: "sales_executive",
    department: "Sales",
  });

  const [editing, setEditing] = useState<{ id: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  const saveEdit = (member: User) => {
    const updated = { ...member, [editing!.field]: editValue };
    upsert("users", updated);
    log({
      userId: user!.id,
      userName: user!.name,
      role: user!.role,
      kind: "role_change",
      entity: "User",
      entityId: member.id,
      description: `Updated ${member.name} ${editing!.field} to ${editValue}.`,
    });
    toast.success(`${editing!.field} updated`);
    setEditing(null);
  };

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
      render: (member) => {
        const isEditing = editing?.id === member.id && editing?.field === "role";
        return isEditing ? (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Select value={editValue} onValueChange={setEditValue}>
              <SelectTrigger className="h-8 w-36">
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
            <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => saveEdit(member)}>
              Save
            </Button>
            <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          </div>
        ) : (
          <button
            className="inline-flex items-center gap-1.5 capitalize hover:text-primary transition-colors group/edit"
            onClick={(e) => {
              e.stopPropagation();
              setEditing({ id: member.id, field: "role" });
              setEditValue(member.role);
            }}
            title="Edit role"
          >
            {member.role.replace("_", " ")}
            <Pencil className="h-3 w-3 opacity-0 group-hover/edit:opacity-100 transition-opacity" />
          </button>
        );
      },
    },
    {
      key: "department",
      header: "Department",
      render: (member) => {
        const isEditing = editing?.id === member.id && editing?.field === "department";
        return isEditing ? (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="h-8 w-36"
            />
            <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => saveEdit(member)}>
              Save
            </Button>
            <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          </div>
        ) : (
          <button
            className="inline-flex items-center gap-1.5 hover:text-primary transition-colors group/edit"
            onClick={(e) => {
              e.stopPropagation();
              setEditing({ id: member.id, field: "department" });
              setEditValue(member.department);
            }}
            title="Edit department"
          >
            {member.department}
            <Pencil className="h-3 w-3 opacity-0 group-hover/edit:opacity-100 transition-opacity" />
          </button>
        );
      },
    },
    { key: "status", header: "Presence", render: (member) => <StatusPill value={member.status} /> },
    {
      key: "lastActive",
      header: "Last Active",
      render: (member) => relTime(member.lastActive),
      accessor: (member) => member.lastActive,
      sortable: true,
    },
  ];

  const invite = () => {
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
      userId: user!.id,
      userName: user!.name,
      role: user!.role,
      kind: "create",
      entity: "User",
      entityId: id,
      description: `Invited ${form.name} (${form.role}).`,
    });
    toast.success("Member invited");
    setOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Team"
        description="Manage members, roles, and access."
        icon={Users}
        actions={
          <Button size="sm" className="gradient-primary text-white" onClick={() => setOpen(true)}>
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
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
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
                <Input
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={invite} className="gradient-primary text-white">
              Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
