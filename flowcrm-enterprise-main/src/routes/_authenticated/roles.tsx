import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShieldCheck, Plus, Trash2, Pencil } from "lucide-react";
import { ALL_PERMISSIONS, type Permission, type RoleDefinition } from "@/lib/types";
import { toast } from "sonner";
import { request } from "@/services/api";

const DEFAULT_ROLES = ["super_admin", "manager", "sales_executive", "marketing"];

export default function RolesPage() {
  const { can, isHydrated, rolesMatrix, setRolesMatrix } = useAuth();
  const { roles, setAll } = useData();
  useEffect(() => {
    document.title = "Roles — FlowCRM";
  }, []);

  const mergedRoles = useMemo(() => {
    return [
      ...DEFAULT_ROLES,
      ...roles.filter((r) => !DEFAULT_ROLES.includes(r.name)).map((r) => r.name),
    ];
  }, [roles]);

  const [matrix, setMatrix] = useState<Record<string, Permission[]>>(() => ({ ...rolesMatrix }));

  useEffect(() => {
    setMatrix({ ...rolesMatrix });
  }, [rolesMatrix]);

  const persistMatrix = (next: Record<string, Permission[]>) => {
    setRolesMatrix(next);
  };

  const toggle = async (role: string, permission: Permission) => {
    if (role === "super_admin") return;
    const currentPerms = new Set(matrix[role] || []);
    if (currentPerms.has(permission)) currentPerms.delete(permission);
    else currentPerms.add(permission);
    const nextPerms = Array.from(currentPerms) as Permission[];

    const roleDef = roles.find((r) => r.name === role);
    if (roleDef) {
      try {
        await request(`/roles/${roleDef.id}`, {
          method: "PUT",
          body: { ...roleDef, permissions: nextPerms },
        });
      } catch {
        toast.error("Failed to sync permissions to server");
        return;
      }
    }

    setMatrix((prev) => {
      const next = { ...prev, [role]: nextPerms };
      persistMatrix(next);
      return next;
    });
    toast.success("Permissions updated");
  };

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  const createRole = async () => {
    if (!form.name.trim()) {
      toast.error("Role name is required");
      return;
    }
    const name = form.name.trim().toLowerCase().replace(/\s+/g, "_");
    try {
      const created = await request<RoleDefinition>("/roles", {
        method: "POST",
        body: { name, description: form.description },
      });
      setAll("roles", [...roles, created]);
      setMatrix((prev) => {
        const next = { ...prev, [name]: [...ALL_PERMISSIONS] };
        persistMatrix(next);
        return next;
      });
      toast.success(`Role "${name}" created`);
    } catch {
      toast.error("Failed to create role");
    } finally {
      setCreateOpen(false);
      setForm({ name: "", description: "" });
    }
  };

  const deleteRole = async (role: string) => {
    const roleDef = roles.find((r) => r.name === role);
    if (!roleDef) return;
    try {
      await request(`/roles/${roleDef.id}`, { method: "DELETE" });
      setAll(
        "roles",
        roles.filter((r) => r.id !== roleDef.id),
      );
      setMatrix((prev) => {
        const next = { ...prev };
        delete next[role];
        persistMatrix(next);
        return next;
      });
      toast.success(`Role "${role}" deleted`);
    } catch {
      toast.error("Failed to delete role");
    }
  };

  const [editOpen, setEditOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<{
    id: string;
    name: string;
    description: string;
    permissions: Permission[];
  } | null>(null);
  const [editForm, setEditForm] = useState({ name: "", description: "" });
  const [editPermissions, setEditPermissions] = useState<Permission[]>([]);

  const openEdit = (roleName: string) => {
    if (roleName === "super_admin") return;
    const roleDef = roles.find((r) => r.name === roleName);
    if (!roleDef) return;
    setEditingRole({
      id: roleDef.id,
      name: roleDef.name,
      description: roleDef.description,
      permissions: (roleDef.permissions ?? []) as Permission[],
    });
    setEditForm({ name: roleDef.name, description: roleDef.description });
    setEditPermissions((roleDef.permissions ?? []) as Permission[]);
    setEditOpen(true);
  };

  const toggleEditPerm = (permission: Permission) => {
    setEditPermissions((prev) =>
      prev.includes(permission) ? prev.filter((p) => p !== permission) : [...prev, permission],
    );
  };

  const saveEdit = async () => {
    if (!editingRole) return;
    if (!editForm.name.trim()) {
      toast.error("Role name is required");
      return;
    }
    const name = editForm.name.trim().toLowerCase().replace(/\s+/g, "_");
    try {
      const updated = await request<RoleDefinition>(`/roles/${editingRole.id}`, {
        method: "PUT",
        body: { name, description: editForm.description, permissions: editPermissions },
      });
      setAll(
        "roles",
        roles.map((r) => (r.id === editingRole.id ? updated : r)),
      );
      setMatrix((prev) => {
        const next = { ...prev };
        delete next[editingRole.name];
        next[name] = editPermissions;
        persistMatrix(next);
        return next;
      });
      toast.success(`Role "${name}" updated`);
    } catch {
      toast.error("Failed to update role");
    } finally {
      setEditOpen(false);
      setEditingRole(null);
    }
  };

  if (!isHydrated)
    return (
      <div className="p-8 text-center text-muted-foreground">Loading...</div>
    );
  if (!can("manage_roles"))
    return (
      <div className="p-8 text-center">
        <p>Access denied.</p>
        <Link to="/dashboard" className="text-primary">
          Back
        </Link>
      </div>
    );

  const builtinRoles = new Set(DEFAULT_ROLES);

  return (
    <div>
      <PageHeader
        title="Roles & Permissions"
        description="Control what each role can see and do."
        icon={ShieldCheck}
        actions={
          <Button
            size="sm"
            className="gradient-primary text-white"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> Create Role
          </Button>
        }
      />
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Permission Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase text-muted-foreground bg-muted/40">
                  <th className="text-left p-3">Permission</th>
                  {mergedRoles.map((role) => (
                    <th key={role} className="p-3 capitalize text-center">
                      <div className="inline-flex items-center gap-1.5">
                        {role.replace(/_/g, " ")}
                        {role !== "super_admin" && (
                          <button
                            onClick={() => openEdit(role)}
                            className="text-muted-foreground hover:text-foreground"
                            title="Edit role"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                        )}
                        {!builtinRoles.has(role) && (
                          <button
                            onClick={() => deleteRole(role)}
                            className="text-destructive hover:text-destructive/80"
                            title="Delete role"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {ALL_PERMISSIONS.map((permission) => (
                  <tr key={permission}>
                    <td className="p-3 font-medium capitalize">{permission.replace(/_/g, " ")}</td>
                    {mergedRoles.map((role) => (
                      <td key={role} className="p-3 text-center">
                        <Checkbox
                          checked={matrix[role]?.includes(permission)}
                          onCheckedChange={() => toggle(role, permission)}
                          disabled={role === "super_admin"}
                          className={role === "super_admin" ? "opacity-50" : ""}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Role Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. support_agent"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="What this role can do"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createRole} className="gradient-primary text-white">
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Role Name</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="e.g. support_agent"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="What this role can do"
              />
            </div>
            <div>
              <Label>Permissions</Label>
              <div className="mt-1 grid grid-cols-2 gap-2">
                {ALL_PERMISSIONS.map((perm) => (
                  <label
                    key={perm}
                    className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={editPermissions.includes(perm)}
                      onCheckedChange={() => toggleEditPerm(perm)}
                    />
                    {perm.replace(/_/g, " ")}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveEdit} className="gradient-primary text-white">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
