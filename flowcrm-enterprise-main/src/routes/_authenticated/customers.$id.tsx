import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useData } from "@/context/DataContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/common/StatusPill";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotesPanel } from "@/components/common/NotesPanel";
import { AttachmentsPanel } from "@/components/common/AttachmentsPanel";
import { Timeline } from "@/components/common/Timeline";
import { fmtDate, initials, fmtCurrency } from "@/lib/format";
import { ArrowLeft, Mail, Phone, Building2 } from "lucide-react";

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const { customers } = useData();

  useEffect(() => {
    document.title = "Customer — FlowCRM";
  }, []);

  const customer = customers.find((entry) => entry.id === id);
  if (!customer)
    return (
      <div className="p-8 text-center">
        Not found.{" "}
        <Link to="/customers" className="text-primary">
          Back
        </Link>
      </div>
    );
  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link to="/customers">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Link>
      </Button>
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="shadow-card">
          <CardContent className="pt-6 text-center">
            <div className="grid h-20 w-20 mx-auto place-items-center rounded-2xl gradient-secondary text-white text-2xl font-bold">
              {initials(customer.name)}
            </div>
            <h2 className="mt-4 text-xl font-bold">{customer.name}</h2>
            <p className="text-sm text-muted-foreground">{customer.company}</p>
            <div className="mt-3">
              <StatusPill value={customer.status} />
            </div>
            <div className="mt-6 space-y-3 text-sm text-left">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" /> {customer.email}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" /> {customer.phone}
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" /> {customer.company}
              </div>
              <div className="rounded-lg bg-muted/40 p-3">
                <div className="text-xs text-muted-foreground">Total Spend</div>
                <div className="text-lg font-bold">{fmtCurrency(customer.totalSpend)}</div>
              </div>
              <div className="pt-3 mt-3 border-t text-xs text-muted-foreground space-y-1">
                <div>Created {fmtDate(customer.createdAt)}</div>
                <div>Updated {fmtDate(customer.updatedAt)}</div>
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
                <Timeline entity="Customer" entityId={customer.id} />
              </TabsContent>
              <TabsContent value="notes" className="mt-4">
                <NotesPanel entity="customer" entityId={customer.id} />
              </TabsContent>
              <TabsContent value="files" className="mt-4">
                <AttachmentsPanel entity="customer" entityId={customer.id} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
