import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Plus, Pencil } from "lucide-react";
import { initials, fmtDate } from "@/lib/format";
import { toast } from "sonner";
import type { Contact } from "@/lib/types";

export default function ContactsPage() {
  const { user, isAdmin, can, isHydrated } = useAuth();
  const { contacts, upsert, bulkRemove, log } = useData();
  const nav = useNavigate();

  useEffect(() => {
    document.title = "Contacts — FlowCRM";
  }, []);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [form, setForm] = useState<any>({ name: "", email: "", phone: "", company: "", title: "" });

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

  const data = isAdmin ? contacts : contacts.filter((contact) => contact.ownerId === user?.id);

  const cols: Column<Contact>[] = [
    {
      key: "name",
      header: "Name",
      sortable: true,
      render: (contact) => (
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full gradient-secondary text-white text-xs font-bold">
            {initials(contact.name)}
          </div>
          <div>
            <div className="font-medium">{contact.name}</div>
            <div className="text-xs text-muted-foreground">{contact.email}</div>
          </div>
        </div>
      ),
    },
    { key: "title", header: "Title", sortable: true },
    { key: "company", header: "Company", sortable: true },
    { key: "phone", header: "Phone" },
    {
      key: "updatedAt",
      header: "Updated",
      sortable: true,
      render: (contact) => fmtDate(contact.updatedAt),
      accessor: (contact) => contact.updatedAt,
    },
    ...(isAdmin
      ? [
          {
            key: "actions" as const,
            header: "",
            render: (contact: Contact) => (
              <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditing(contact);
                    setForm({
                      name: contact.name,
                      email: contact.email,
                      phone: contact.phone,
                      company: contact.company,
                      title: contact.title,
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
      upsert("contacts", {
        ...editing,
        ...form,
        updatedAt: new Date().toISOString(),
      } as Contact);
      log({
        userId: user.id,
        userName: user.name,
        role: user.role,
        kind: "update",
        entity: "Contact",
        entityId: editing.id,
        description: `Updated contact ${form.name}`,
      });
      toast.success("Contact updated");
    } else {
      const id = `ct_${Date.now()}`;
      upsert("contacts", {
        ...form,
        id,
        ownerId: user.id,
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Contact);
      log({
        userId: user.id,
        userName: user.name,
        role: user.role,
        kind: "create",
        entity: "Contact",
        entityId: id,
        description: `Created contact ${form.name}`,
      });
      toast.success("Contact created");
    }
    setOpen(false);
    setEditing(null);
    setForm({ name: "", email: "", phone: "", company: "", title: "" });
  };

  return (
    <div>
      <PageHeader
        title="Contacts"
        description="People at the companies you sell to."
        icon={Users}
        actions={
          <Button size="sm" className="gradient-primary text-white" onClick={() => { setEditing(null); setForm({ name: "", email: "", phone: "", company: "", title: "" }); setOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> New Contact
          </Button>
        }
      />
      <DataTable
        data={data}
        columns={cols}
        searchPlaceholder="Search contacts, companies, emails…"
        searchKeys={["name", "email", "phone", "company", "title"]}
        exportName="contacts"
        onRowClick={(contact) => nav("/contacts/" + contact.id)}
        bulkActions={[
          {
            label: "Delete",
            destructive: true,
            onClick: (ids) => {
              bulkRemove("contacts", ids);
              toast.success(`Deleted ${ids.length}`);
            },
          },
        ]}
      />
      <Dialog open={open} onOpenChange={(v) => { if (!v) { setOpen(false); setEditing(null); setForm({ name: "", email: "", phone: "", company: "", title: "" }); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Contact" : "New Contact"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            {["name", "email", "phone", "company", "title"].map((field) => (
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
            <Button variant="outline" onClick={() => { setOpen(false); setEditing(null); setForm({ name: "", email: "", phone: "", company: "", title: "" }); }}>
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
