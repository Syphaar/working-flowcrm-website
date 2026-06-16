import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { storage } from "@/lib/storage";
import { StatCard } from "@/components/common/StatCard";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusPill } from "@/components/common/StatusPill";
import { fmtCurrency, fmtDate, fmtNumber, relTime, initials } from "@/lib/format";
import {
  LayoutDashboard,
  UserPlus,
  Briefcase,
  Users,
  DollarSign,
  Target,
  Percent,
  ListChecks,
  Download,
  Plus,
  Settings as SettingsIcon,
  GripVertical,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { format, subMonths, startOfMonth } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { exportCSV, exportPDF, exportXLSX } from "@/lib/exporters";
import { toast } from "sonner";

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const { leads, customers, deals, tasks, activities, users, notifications } = useData();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Dashboard — FlowCRM";
  }, []);

  const scope = isAdmin ? null : user?.id;
  const myLeads = scope ? leads.filter((lead) => lead.ownerId === scope) : leads;
  const myDeals = scope ? deals.filter((deal) => deal.ownerId === scope) : deals;
  const myCustomers = scope
    ? customers.filter((customer) => customer.ownerId === scope)
    : customers;
  const myTasks = scope ? tasks.filter((task) => task.assigneeId === scope) : tasks;

  const revenue = myDeals
    .filter((deal) => deal.status === "Won")
    .reduce((sum, deal) => sum + deal.value, 0);
  const forecast = myDeals
    .filter((deal) => deal.status === "Open")
    .reduce((sum, deal) => sum + deal.value * (deal.probability / 100), 0);
  const wonCount = myDeals.filter((deal) => deal.status === "Won").length;
  const conversion = myDeals.length ? Math.round((wonCount / myDeals.length) * 100) : 0;
  const tasksDue = myTasks.filter((task) => task.status !== "Done").length;

  const revenueSeries = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => startOfMonth(subMonths(new Date(), 5 - i)));
    return months.map((month) => {
      const label = format(month, "MMM");
      const monthDeals = myDeals.filter((deal) => {
        const dt = new Date(deal.closeDate);
        return dt.getMonth() === month.getMonth() && dt.getFullYear() === month.getFullYear();
      });
      return {
        month: label,
        revenue: monthDeals
          .filter((deal) => deal.status === "Won")
          .reduce((sum, deal) => sum + deal.value, 0),
        forecast: monthDeals
          .filter((deal) => deal.status === "Open")
          .reduce((sum, deal) => sum + deal.value * (deal.probability / 100), 0),
      };
    });
  }, [myDeals]);

  const pipelineData = useMemo(() => {
    const stages = [
      "New Lead",
      "Contacted",
      "Qualified",
      "Proposal Sent",
      "Negotiation",
      "Won",
      "Lost",
    ];
    return stages.map((stage) => ({
      stage: stage,
      count: myDeals.filter((deal) => deal.stage === stage).length,
      value: myDeals
        .filter((deal) => deal.stage === stage)
        .reduce((sum, deal) => sum + deal.value, 0),
    }));
  }, [myDeals]);

  const teamPerformance = useMemo(() => {
    return users.slice(0, 6).map((user) => ({
      name: user.name.split(" ")[0],
      deals: deals.filter((deal) => deal.ownerId === user.id && deal.status === "Won").length,
      revenue: deals
        .filter((deal) => deal.ownerId === user.id && deal.status === "Won")
        .reduce((sum, deal) => sum + deal.value, 0),
    }));
  }, [users, deals]);

  const pieColors = ["#4F46E5", "#06B6D4", "#F97316", "#22C55E", "#F59E0B", "#EF4444", "#8B5CF6"];

  const heatmap = useMemo(() => {
    const grid: number[][] = Array.from({ length: 7 }, () => Array(20).fill(0));
    activities.forEach((activity) => {
      const date = new Date(activity.createdAt);
      const week = Math.floor((Date.now() - date.getTime()) / (7 * 86400000));
      if (week >= 0 && week < 20) grid[date.getDay()][19 - week]++;
    });
    return grid;
  }, [activities]);

  const ALL_WIDGETS = [
    "revenue",
    "pipeline",
    "activities",
    "tasks",
    "customers",
    "team",
    "goals",
    "heatmap",
  ] as const;
  type WidgetKey = (typeof ALL_WIDGETS)[number];
  const DEFAULT_LAYOUT: WidgetKey[] = [...ALL_WIDGETS];
  const [layout, setLayout] = useState<WidgetKey[]>(() =>
    storage.get<WidgetKey[]>("dashboard:layout", DEFAULT_LAYOUT),
  );
  const visible = (widgetKey: WidgetKey) => layout.includes(widgetKey);
  const toggle = (key: WidgetKey) => {
    const next = layout.includes(key) ? layout.filter((item) => item !== key) : [...layout, key];
    setLayout(next);
    storage.set("dashboard:layout", next);
  };
  const reset = () => {
    setLayout(DEFAULT_LAYOUT);
    storage.set("dashboard:layout", DEFAULT_LAYOUT);
    toast.success("Layout restored");
  };

  const exportRows = myDeals.map((deal) => ({
    Deal: deal.name,
    Customer: deal.customerName,
    Stage: deal.stage,
    Status: deal.status,
    Value: deal.value,
    Close: fmtDate(deal.closeDate),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={isAdmin ? "Super Admin Dashboard" : "My Dashboard"}
        description={
          isAdmin
            ? "Company-wide performance and revenue at a glance."
            : "Your assigned pipeline and activity."
        }
        icon={LayoutDashboard}
        actions={
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" /> Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => exportCSV("dashboard-deals", exportRows)}>
                  CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportXLSX("dashboard-deals", exportRows)}>
                  Excel
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => exportPDF("dashboard-deals", exportRows, "Deals export")}
                >
                  PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <SettingsIcon className="mr-2 h-4 w-4" /> Widgets
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Customize</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {ALL_WIDGETS.map((widget) => (
                  <DropdownMenuCheckboxItem
                    key={widget}
                    checked={visible(widget)}
                    onCheckedChange={() => toggle(widget)}
                    className="capitalize"
                  >
                    {widget}
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={reset}>Restore defaults</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              size="sm"
              className="gradient-primary text-white"
              onClick={() => navigate("/leads")}
            >
              <Plus className="mr-2 h-4 w-4" /> New Lead
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Leads"
          value={fmtNumber(myLeads.length)}
          icon={UserPlus}
          accent="primary"
          hint="All sources"
          delta={{ value: 12, positive: true }}
        />
        <StatCard
          label="Customers"
          value={fmtNumber(myCustomers.length)}
          icon={Users}
          accent="secondary"
          hint="Active accounts"
          delta={{ value: 4, positive: true }}
        />
        <StatCard
          label="Open Deals"
          value={fmtNumber(myDeals.filter((deal) => deal.status === "Open").length)}
          icon={Briefcase}
          accent="accent"
          hint="In pipeline"
        />
        <StatCard
          label="Revenue"
          value={fmtCurrency(revenue)}
          icon={DollarSign}
          accent="success"
          hint="Closed Won"
          delta={{ value: 18, positive: true }}
        />
        <StatCard
          label="Forecast"
          value={fmtCurrency(forecast)}
          icon={Target}
          accent="primary"
          hint="Weighted pipeline"
        />
        <StatCard
          label="Conversion"
          value={`${conversion}%`}
          icon={Percent}
          accent="warning"
          hint="Won / Total"
        />
        <StatCard
          label="Tasks Due"
          value={fmtNumber(tasksDue)}
          icon={ListChecks}
          accent="danger"
          hint="Open + In Progress"
        />
        <StatCard
          label="Notifications"
          value={fmtNumber(
            notifications.filter(
              (notification) => notification.recipientId === user?.id && !notification.read,
            ).length,
          )}
          icon={Briefcase}
          accent="secondary"
          hint="Unread"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {visible("revenue") && (
          <Card className="lg:col-span-2 shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Revenue & Forecast</CardTitle>
              <Badge variant="secondary">Last 6 months</Badge>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueSeries}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#06B6D4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: unknown) => fmtCurrency(Number(value) || 0)}
                    contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#4F46E5"
                    fill="url(#g1)"
                    strokeWidth={2}
                    name="Revenue"
                  />
                  <Area
                    type="monotone"
                    dataKey="forecast"
                    stroke="#06B6D4"
                    fill="url(#g2)"
                    strokeWidth={2}
                    name="Forecast"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
        {visible("pipeline") && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Sales Pipeline</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pipelineData.filter((p) => p.count > 0)}
                    dataKey="count"
                    nameKey="stage"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {pipelineData.map((_, index) => (
                      <Cell key={index} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {visible("team") && isAdmin && (
          <Card className="lg:col-span-2 shadow-card">
            <CardHeader>
              <CardTitle>Team Performance</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teamPerformance}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="deals" fill="#4F46E5" radius={[8, 8, 0, 0]} name="Deals Won" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
        {visible("activities") && (
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <Link to="/activities" className="text-xs text-primary hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {activities.slice(0, 6).map((activity) => (
                  <li key={activity.id} className="flex gap-3">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {initials(activity.userName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm line-clamp-1">
                        <span className="font-medium">{activity.userName}</span>{" "}
                        <span className="text-muted-foreground">
                          {activity.kind.replace("_", " ")}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {relTime(activity.createdAt)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {visible("tasks") && (
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Upcoming Tasks</CardTitle>
              <Link to="/tasks" className="text-xs text-primary hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {myTasks
                  .filter((task) => task.status !== "Done")
                  .slice(0, 6)
                  .map((task) => (
                    <li
                      key={task.id}
                      className="flex items-center justify-between gap-3 rounded-lg border bg-card p-3"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{task.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Due {fmtDate(task.dueDate)}
                        </div>
                      </div>
                      <StatusPill value={task.priority} />
                    </li>
                  ))}
              </ul>
            </CardContent>
          </Card>
        )}
        {visible("customers") && (
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Customers</CardTitle>
              <Link to="/customers" className="text-xs text-primary hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {myCustomers.slice(0, 6).map((customer) => (
                  <li
                    key={customer.id}
                    className="flex items-center justify-between gap-3 rounded-lg border bg-card p-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full gradient-secondary text-white text-xs font-bold">
                        {initials(customer.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{customer.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {customer.company}
                        </div>
                      </div>
                    </div>
                    <StatusPill value={customer.status} />
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {visible("heatmap") && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Activity Heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-1 overflow-x-auto">
              {Array.from({ length: 20 }, (_, week) => (
                <div key={week} className="flex flex-col gap-1">
                  {Array.from({ length: 7 }, (_, day) => {
                    const value = heatmap[day][week] || 0;
                    const intensity = Math.min(4, Math.floor(value / 2));
                    const tones = [
                      "bg-muted",
                      "bg-primary/20",
                      "bg-primary/40",
                      "bg-primary/70",
                      "bg-primary",
                    ];
                    return (
                      <div
                        key={day}
                        className={`h-3 w-3 rounded-sm ${tones[intensity]}`}
                        title={`${value} activities`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              Less{" "}
              {["bg-muted", "bg-primary/20", "bg-primary/40", "bg-primary/70", "bg-primary"].map(
                (color, index) => (
                  <span key={index} className={`h-3 w-3 rounded-sm ${color}`} />
                ),
              )}{" "}
              More
            </div>
          </CardContent>
        </Card>
      )}

      {visible("goals") && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Quarterly Goals</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Revenue Target", value: revenue, target: 2_000_000 },
              { label: "Deals Won", value: wonCount, target: 50 },
              { label: "New Customers", value: myCustomers.length, target: 60 },
            ].map((goal) => {
              const pct = Math.min(100, Math.round((goal.value / goal.target) * 100));
              return (
                <div key={goal.label}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">{goal.label}</span>
                    <span className="text-muted-foreground">{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full gradient-primary" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {typeof goal.value === "number" && goal.value > 1000
                      ? fmtCurrency(goal.value)
                      : goal.value}{" "}
                    of{" "}
                    {typeof goal.target === "number" && goal.target > 1000
                      ? fmtCurrency(goal.target)
                      : goal.target}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
