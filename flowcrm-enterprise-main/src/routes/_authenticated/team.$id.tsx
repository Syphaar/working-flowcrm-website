import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useData } from "@/context/DataContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/common/StatusPill";
import { initials, fmtTimestamp, relTime } from "@/lib/format";
import { ArrowLeft, Mail, Phone, Building2, KeyRound, ShieldCheck, LogOut } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Timeline } from "@/components/common/Timeline";
import { NotesPanel } from "@/components/common/NotesPanel";
import { fmtCurrency } from "@/lib/format";

export default function TeamMemberDetail() {
  const { id } = useParams<{ id: string }>();
  const { users, deals, leads } = useData();

  useEffect(() => {
    document.title = "Member — FlowCRM";
  }, []);

  const member = users.find((entry) => entry.id === id);
  if (!member)
    return (
      <div className="p-8 text-center">
        Not found.{" "}
        <Link to="/team" className="text-primary">
          Back
        </Link>
      </div>
    );
  const won = deals.filter((deal) => deal.ownerId === member.id && deal.status === "Won");
  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link to="/team">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Link>
      </Button>
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="shadow-card">
          <CardContent className="pt-6 text-center">
            <div className="grid h-20 w-20 mx-auto place-items-center rounded-2xl gradient-primary text-white text-2xl font-bold">
              {initials(member.name)}
            </div>
            <h2 className="mt-4 text-xl font-bold">{member.name}</h2>
            <p className="text-sm text-muted-foreground capitalize">
              {member.role.replace("_", " ")} · {member.department}
            </p>
            <div className="mt-3">
              <StatusPill value={member.status} />
            </div>
            <div className="mt-6 space-y-3 text-sm text-left">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" /> {member.email}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" /> {member.phone}
              </div>
              <div className="flex items-start gap-2">
                <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <span
                  className="font-mono text-[10px] break-all leading-relaxed"
                  title={member.password || "—"}
                >
                  {member.password ? member.password : "—"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                {member.twoFactor ? (
                  <span className="text-green-600 font-medium">Enabled</span>
                ) : (
                  <span className="text-muted-foreground">Disabled</span>
                )}
              </div>
              {member.twoFactor && member.twoFactorSecret && (
                <div className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">2FA Secret</div>
                    <span
                      className="font-mono text-[10px] break-all leading-relaxed"
                      title={member.twoFactorSecret}
                    >
                      {member.twoFactorSecret}
                    </span>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div>
                  <div className="text-xs text-muted-foreground">Deals Won</div>
                  <div className="font-bold text-lg">{won.length}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Revenue</div>
                  <div className="font-bold text-lg">
                    {fmtCurrency(won.reduce((sum, deal) => sum + deal.value, 0))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Leads</div>
                  <div className="font-bold text-lg">
                    {leads.filter((lead) => lead.ownerId === member.id).length}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Phone</div>
                  <div className="font-semibold text-sm">{member.phone}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Last Active</div>
                  <div className="font-semibold text-sm">{relTime(member.lastActive)}</div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground border-t pt-3 space-y-1">
                <div className="flex items-center gap-1">
                  <LogOut className="h-3 w-3" /> Last login: {member.lastLogin ? fmtTimestamp(member.lastLogin) : "—"}
                </div>
                <div className="flex items-center gap-1">
                  <LogOut className="h-3 w-3" /> Last logout: {member.lastLogout ? fmtTimestamp(member.lastLogout) : "—"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2 shadow-card">
          <CardContent className="pt-6">
            <Tabs defaultValue="timeline">
              <TabsList>
                <TabsTrigger value="timeline">Activity</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>
              <TabsContent value="timeline" className="mt-4">
                <Timeline entity="User" entityId={member.id} />
              </TabsContent>
              <TabsContent value="notes" className="mt-4">
                <NotesPanel entity="user" entityId={member.id} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
