import { getAll } from "../config/database.js";
import { calculateSum, generateMonthlySeries } from "../utils/analytics.js";
import { filterByOwner } from "../utils/filtering.js";

export function getDashboardData(userId: string, isAdmin: boolean) {
  const deals = getAll<any>("deals");
  const leads = getAll<any>("leads");
  const customers = getAll<any>("customers");
  const contacts = getAll<any>("contacts");
  const tasks = getAll<any>("tasks");
  const activities = getAll<any>("activities");
  const users = getAll<any>("users");

  const filteredLeads = filterByOwner(leads, userId, isAdmin);
  const filteredDeals = filterByOwner(deals, userId, isAdmin);
  const filteredCustomers = filterByOwner(customers, userId, isAdmin);
  const filteredContacts = filterByOwner(contacts, userId, isAdmin);
  const filteredTasks = filterByOwner(tasks, userId, isAdmin);

  const totalLeads = filteredLeads.length;
  const activeLeads = filteredLeads.filter(
    (lead) => lead.status === "Active"
  ).length;
  const totalDeals = filteredDeals.length;
  const dealsWon = filteredDeals.filter(
    (deal) => deal.status === "Won"
  ).length;
  const totalRevenue = calculateSum(
    filteredDeals
      .filter((deal) => deal.status === "Won")
      .map((deal) => deal.value)
  );
  const totalCustomers = filteredCustomers.length;
  const totalContacts = filteredContacts.length;
  const totalTasks = filteredTasks.length;
  const tasksDone = filteredTasks.filter(
    (task) => task.status === "Done"
  ).length;

  const pipelineTotal = calculateSum(
    deals
      .filter((deal) => deal.status === "Open")
      .map((deal) => deal.value)
  );

  const stages = [
    "New Lead",
    "Contacted",
    "Qualified",
    "Proposal Sent",
    "Negotiation",
    "Won",
    "Lost",
  ];
  const stageBreakdown = stages
    .map((stage) => {
      const stageDeals = deals.filter((deal) => deal.stage === stage);
      return {
        stage,
        count: stageDeals.length,
        total: calculateSum(stageDeals.map((deal) => deal.value)),
      };
    })
    .filter((stage) => stage.count > 0);

  const recentActivities = activities.slice(0, 10);
  const upcomingTasks = filteredTasks
    .filter((task) => task.status !== "Done")
    .sort(
      (taskA, taskB) =>
        new Date(taskA.dueDate).getTime() - new Date(taskB.dueDate).getTime()
    )
    .slice(0, 8);

  const teamPerformance = users.slice(0, 8).map((user) => ({
    id: user.id,
    name: user.name,
    role: user.role,
    status: user.status,
    dealsWon: deals.filter(
      (deal) => deal.ownerId === user.id && deal.status === "Won"
    ).length,
    revenue: calculateSum(
      deals
        .filter(
          (deal) => deal.ownerId === user.id && deal.status === "Won"
        )
        .map((deal) => deal.value)
    ),
    leadCount: leads.filter((lead) => lead.ownerId === user.id).length,
  }));

  const revenueSeries = generateMonthlySeries(
    deals.filter((deal) => deal.status === "Won"),
    "closeDate",
    "value"
  );

  return {
    totalLeads,
    activeLeads,
    totalDeals,
    dealsWon,
    totalRevenue,
    totalCustomers,
    totalContacts,
    totalTasks,
    tasksDone,
    pipelineTotal,
    stageBreakdown,
    recentActivities,
    upcomingTasks,
    teamPerformance,
    revenueSeries,
  };
}
