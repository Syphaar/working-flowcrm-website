import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/common/StatusPill";
import { NotesPanel } from "@/components/common/NotesPanel";
import { AttachmentsPanel } from "@/components/common/AttachmentsPanel";
import { Timeline } from "@/components/common/Timeline";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fmtCurrency, fmtDate, initials } from "@/lib/format";
import { ArrowLeft, Mail, Phone, Building2 } from "lucide-react";

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const { leads, users } = useData();

  useEffect(() => {
    document.title = "Lead — FlowCRM";
  }, []);

  const lead = leads.find((lead) => lead.id === id);
  if (!lead)
    return (
      <div className="p-8 text-center text-muted-foreground">
        Lead not found.{" "}
        <Link to="/leads" className="text-primary">
          Back to leads
        </Link>
      </div>
    );
  const owner = users.find((user) => user.id === lead.ownerId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link to="/leads">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 shadow-card">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="grid h-20 w-20 place-items-center rounded-2xl gradient-primary text-white text-2xl font-bold shadow-elevated">
                {initials(lead.name)}
              </div>
              <h2 className="mt-4 text-xl font-bold">{lead.name}</h2>
              <p className="text-sm text-muted-foreground">{lead.company}</p>
              <div className="mt-3 flex gap-2">
                <StatusPill value={lead.stage} />
                <StatusPill value={lead.status} />
              </div>
            </div>
            <div className="mt-6 space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" /> {lead.email}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" /> {lead.phone}
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" /> {lead.company}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-muted-foreground">Value</div>
                  <div className="font-semibold">{fmtCurrency(lead.value)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Source</div>
                  <div className="font-semibold">{lead.source}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Owner</div>
                  <div className="font-semibold">{owner?.name ?? "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Created</div>
                  <div className="font-semibold">{fmtDate(lead.createdAt)}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader>
            <CardTitle>Lead workspace</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="timeline">
              <TabsList>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="files">Attachments</TabsTrigger>
              </TabsList>
              <TabsContent value="timeline" className="mt-4">
                <Timeline entity="Lead" entityId={lead.id} />
              </TabsContent>
              <TabsContent value="notes" className="mt-4">
                <NotesPanel entity="lead" entityId={lead.id} />
              </TabsContent>
              <TabsContent value="files" className="mt-4">
                <AttachmentsPanel entity="lead" entityId={lead.id} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
