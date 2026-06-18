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
import { fmtCurrency, fmtDate } from "@/lib/format";
import { ArrowLeft, Briefcase } from "lucide-react";

export default function DealDetail() {
  const { id } = useParams<{ id: string }>();
  const { deals } = useData();

  useEffect(() => {
    document.title = "Deal — FlowCRM";
  }, []);

  const deal = deals.find((entry) => entry.id === id);
  if (!deal)
    return (
      <div className="p-8 text-center">
        Not found.{" "}
        <Link to="/deals" className="text-primary">
          Back
        </Link>
      </div>
    );
  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link to="/deals">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Link>
      </Button>
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-2xl gradient-accent text-white">
              <Briefcase className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold">{deal.name}</h2>
              <p className="text-sm text-muted-foreground">{deal.customerName}</p>
              <div className="mt-3 flex flex-wrap gap-4">
                <div>
                  <div className="text-xs text-muted-foreground">Value</div>
                  <div className="font-bold text-lg">{fmtCurrency(deal.value)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Stage</div>
                  <StatusPill value={deal.stage} />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Status</div>
                  <StatusPill value={deal.status} />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Win Probability</div>
                  <div className="font-semibold">{deal.probability}%</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Close Date</div>
                  <div className="font-semibold">{fmtDate(deal.closeDate)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Created</div>
                  <div className="font-semibold">{fmtDate(deal.createdAt)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Updated</div>
                  <div className="font-semibold">{fmtDate(deal.updatedAt)}</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <Tabs defaultValue="timeline">
            <TabsList>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="files">Files</TabsTrigger>
            </TabsList>
            <TabsContent value="timeline" className="mt-4">
              <Timeline entity="Deal" entityId={deal.id} />
            </TabsContent>
            <TabsContent value="notes" className="mt-4">
              <NotesPanel entity="deal" entityId={deal.id} />
            </TabsContent>
            <TabsContent value="files" className="mt-4">
              <AttachmentsPanel entity="deal" entityId={deal.id} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
