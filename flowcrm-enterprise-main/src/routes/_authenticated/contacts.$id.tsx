import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useData } from "@/context/DataContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotesPanel } from "@/components/common/NotesPanel";
import { AttachmentsPanel } from "@/components/common/AttachmentsPanel";
import { Timeline } from "@/components/common/Timeline";
import { fmtDate, initials } from "@/lib/format";
import { ArrowLeft, Mail, Phone, Building2 } from "lucide-react";

export default function ContactDetail() {
  const { id } = useParams<{ id: string }>();
  const { contacts } = useData();

  useEffect(() => {
    document.title = "Contact — FlowCRM";
  }, []);

  const contact = contacts.find((entry) => entry.id === id);
  if (!contact)
    return (
      <div className="p-8 text-center">
        Contact not found.{" "}
        <Link to="/contacts" className="text-primary">
          Back
        </Link>
      </div>
    );
  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link to="/contacts">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Link>
      </Button>
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="shadow-card">
          <CardContent className="pt-6 text-center">
            <div className="grid h-20 w-20 mx-auto place-items-center rounded-2xl gradient-secondary text-white text-2xl font-bold">
              {initials(contact.name)}
            </div>
            <h2 className="mt-4 text-xl font-bold">{contact.name}</h2>
            <p className="text-sm text-muted-foreground">
              {contact.title} · {contact.company}
            </p>
            <div className="mt-6 space-y-3 text-sm text-left">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" /> {contact.email}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" /> {contact.phone}
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" /> {contact.company}
              </div>
              <div className="pt-3 mt-3 border-t text-xs text-muted-foreground space-y-1">
                <div>Created {fmtDate(contact.createdAt)}</div>
                <div>Updated {fmtDate(contact.updatedAt)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2 shadow-card">
          <CardContent className="pt-6">
            <Tabs defaultValue="timeline">
              <TabsList>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="files">Files</TabsTrigger>
              </TabsList>
              <TabsContent value="timeline" className="mt-4">
                <Timeline entity="Contact" entityId={contact.id} />
              </TabsContent>
              <TabsContent value="notes" className="mt-4">
                <NotesPanel entity="contact" entityId={contact.id} />
              </TabsContent>
              <TabsContent value="files" className="mt-4">
                <AttachmentsPanel entity="contact" entityId={contact.id} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
