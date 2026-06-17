import { useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { format, subMonths, startOfMonth } from "date-fns";
import { fmtCurrency } from "@/lib/format";

export default function ReportsPage() {
  const { can } = useAuth();
  const { deals, leads, customers, users } = useData();
  useEffect(() => {
    document.title = "Reports — FlowCRM";
  }, []);
  const COLORS = ["#4F46E5", "#06B6D4", "#F97316", "#22C55E", "#F59E0B", "#EF4444"];

  const months = useMemo(
    () => Array.from({ length: 12 }, (_, i) => startOfMonth(subMonths(new Date(), 11 - i))),
    [],
  );
  const revenueSeries = months.map((month) => ({
    month: format(month, "MMM"),
    revenue: deals
      .filter(
        (deal) =>
          deal.status === "Won" &&
          new Date(deal.closeDate).getMonth() === month.getMonth() &&
          new Date(deal.closeDate).getFullYear() === month.getFullYear(),
      )
      .reduce((sum, deal) => sum + deal.value, 0),
    leads: leads.filter((lead) => new Date(lead.createdAt).getMonth() === month.getMonth()).length,
    customers: customers.filter(
      (customer) =>
        new Date(customer.createdAt).getMonth() === month.getMonth() &&
        new Date(customer.createdAt).getFullYear() === month.getFullYear(),
    ).length,
  }));

  const teamData = users
    .map((user) => ({
      name: user.name.split(" ")[0],
      deals: deals.filter((deal) => deal.ownerId === user.id && deal.status === "Won").length,
      revenue: deals
        .filter((deal) => deal.ownerId === user.id && deal.status === "Won")
        .reduce((sum, deal) => sum + deal.value, 0),
      leads: leads.filter((lead) => lead.ownerId === user.id).length,
    }))
    .slice(0, 8);

  const conversionData = [
    "New Lead",
    "Contacted",
    "Qualified",
    "Proposal Sent",
    "Negotiation",
    "Won",
  ].map((stage) => ({
    stage: stage,
    value: leads.filter((lead) => lead.stage === stage).length,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        description="Revenue, performance, conversion — everything that matters."
        icon={BarChart3}
      />
      <div className="grid lg:grid-cols-2 gap-4">
        {can("view_revenue") && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer>
                <AreaChart data={revenueSeries}>
                  <defs>
                    <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                  <Tooltip formatter={(value: unknown) => fmtCurrency(Number(value) || 0)} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#4F46E5"
                    fill="url(#rg)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Customer Growth</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer>
              <LineChart data={revenueSeries}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="customers"
                  stroke="#06B6D4"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="leads"
                  stroke="#F97316"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Team Performance</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer>
              <BarChart data={teamData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="deals" fill="#4F46E5" radius={[6, 6, 0, 0]} />
                <Bar dataKey="leads" fill="#06B6D4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Lead Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={conversionData}
                  dataKey="value"
                  nameKey="stage"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {conversionData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Per-Member Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted-foreground bg-muted/40">
                <tr>
                  <th className="text-left p-3">Member</th>
                  <th className="text-left p-3">Role</th>
                  <th className="text-left p-3">Deals Won</th>
                  {can("view_revenue") && <th className="text-left p-3">Revenue</th>}
                  <th className="text-left p-3">Leads</th>
                  <th className="text-left p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((user) => {
                  const won = deals.filter(
                    (deal) => deal.ownerId === user.id && deal.status === "Won",
                  );
                  return (
                    <tr key={user.id}>
                      <td className="p-3 font-medium">{user.name}</td>
                      <td className="p-3 capitalize text-muted-foreground">
                        {user.role.replace("_", " ")}
                      </td>
                      <td className="p-3">{won.length}</td>
                      {can("view_revenue") && (
                        <td className="p-3 font-semibold">
                          {fmtCurrency(won.reduce((sum, deal) => sum + deal.value, 0))}
                        </td>
                      )}
                      <td className="p-3">
                        {leads.filter((lead) => lead.ownerId === user.id).length}
                      </td>
                      <td className="p-3 capitalize">{user.status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
