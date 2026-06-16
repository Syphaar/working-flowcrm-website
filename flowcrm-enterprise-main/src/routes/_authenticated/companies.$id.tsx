import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/common/StatusPill";
import { ArrowLeft, Building2, Globe, MapPin, Pencil, Plus, Trash2, Save, X } from "lucide-react";
import { fmtCurrency, fmtNumber } from "@/lib/format";
import { toast } from "sonner";
import type { Contact } from "@/lib/types";

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { companies, contacts, deals, upsert, remove, log } = useData();

  useEffect(() => {
    document.title = "Company — FlowCRM";
  }, []);

  const company = companies.find((entry) => entry.id === id);
  if (!company)
    return (
      <div className="p-8 text-center">
        Not found.{" "}
        <Link to="/companies" className="text-primary">
          Back
        </Link>
      </div>
    );

  const relContacts = contacts.filter((entry) => entry.company === company.name);
  const relDeals = deals.filter(
    (entry) => entry.customerName.includes(company.name) || entry.name.includes(company.name),
  );

  const [editMap, setEditMap] = useState<Record<string, { name: string; title: string }>>({});
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTitle, setNewTitle] = useState("");

  const startEdit = (contact: Contact) => {
    setEditMap((prev) => ({ ...prev, [contact.id]: { name: contact.name, title: contact.title } }));
  };

  const cancelEdit = (id: string) => {
    setEditMap((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const saveEdit = (contact: Contact) => {
    const values = editMap[contact.id];
    if (!values) return;
    upsert("contacts", { ...contact, name: values.name, title: values.title });
    log({
      userId: user!.id,
      userName: user!.name,
      role: user!.role,
      kind: "update",
      entity: "Contact",
      entityId: contact.id,
      description: `Updated contact ${values.name}`,
    });
    toast.success("Contact updated");
    cancelEdit(contact.id);
  };

  const deleteContact = (contact: Contact) => {
    remove("contacts", contact.id);
    log({
      userId: user!.id,
      userName: user!.name,
      role: user!.role,
      kind: "delete",
      entity: "Contact",
      entityId: contact.id,
      description: `Deleted contact ${contact.name}`,
    });
    toast.success("Contact removed");
  };

  const addContact = () => {
    if (!user || !newName.trim()) return;
    const id = `ct_${Date.now()}`;
    upsert("contacts", {
      id,
      name: newName.trim(),
      email: "",
      phone: "",
      company: company.name,
      companyId: company.id,
      title: newTitle.trim(),
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
      description: `Created contact ${newName.trim()} for ${company.name}`,
    });
    toast.success("Contact added");
    setNewName("");
    setNewTitle("");
    setAdding(false);
  };

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link to="/companies">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Link>
      </Button>
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl gradient-primary text-white">
              <Building2 className="h-7 w-7" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">{company.name}</h2>
                <StatusPill value={company.status} />
              </div>
              <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground text-xs">Industry</div>
                  <div className="font-medium">{company.industry}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Employees</div>
                  <div className="font-medium">{fmtNumber(company.employees)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Revenue</div>
                  <div className="font-medium">{fmtCurrency(company.revenue)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs flex items-center gap-1">
                    <Globe className="h-3 w-3" /> Website
                  </div>
                  <div className="font-medium truncate">{company.website}</div>
                </div>
              </div>
              <div className="mt-2 text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {company.address}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Related Contacts ({relContacts.length})</CardTitle>
            <Button size="sm" variant="outline" onClick={() => setAdding(true)}>
              <Plus className="mr-1 h-4 w-4" /> Add
            </Button>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {adding && (
                <li className="flex items-center gap-2 rounded border p-2">
                  <Input
                    placeholder="Name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="h-8 text-sm"
                  />
                  <Input
                    placeholder="Position"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="h-8 text-sm"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 shrink-0"
                    onClick={addContact}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 shrink-0"
                    onClick={() => {
                      setAdding(false);
                      setNewName("");
                      setNewTitle("");
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </li>
              )}
              {relContacts.map((contact) => {
                const editing = contact.id in editMap;
                return (
                  <li
                    key={contact.id}
                    className="flex items-center gap-2 rounded border p-2 text-sm"
                  >
                    {editing ? (
                      <>
                        <Input
                          value={editMap[contact.id].name}
                          onChange={(e) =>
                            setEditMap((prev) => ({
                              ...prev,
                              [contact.id]: { ...prev[contact.id], name: e.target.value },
                            }))
                          }
                          className="h-8 text-sm"
                        />
                        <Input
                          value={editMap[contact.id].title}
                          onChange={(e) =>
                            setEditMap((prev) => ({
                              ...prev,
                              [contact.id]: { ...prev[contact.id], title: e.target.value },
                            }))
                          }
                          className="h-8 text-sm"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 shrink-0"
                          onClick={() => saveEdit(contact)}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 shrink-0"
                          onClick={() => cancelEdit(contact.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 truncate">{contact.name}</span>
                        <span className="text-muted-foreground truncate">{contact.title}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 shrink-0"
                          onClick={() => startEdit(contact)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 shrink-0 text-destructive"
                          onClick={() => deleteContact(contact)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                  </li>
                );
              })}
              {relContacts.length === 0 && !adding && (
                <li className="text-sm text-muted-foreground">No contacts yet.</li>
              )}
            </ul>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Related Deals ({relDeals.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {relDeals.slice(0, 8).map((deal) => (
                <li key={deal.id} className="flex justify-between rounded border p-2 text-sm">
                  <span>{deal.name}</span>
                  <span className="font-medium">{fmtCurrency(deal.value)}</span>
                </li>
              ))}
              {relDeals.length === 0 && (
                <li className="text-sm text-muted-foreground">No deals.</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
