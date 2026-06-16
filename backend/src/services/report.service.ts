import { getAll } from "../config/database.js";
import { calculateSum, generateMonthlySeries } from "../utils/analytics.js";

export function getRevenueReport() {
  const deals = getAll<any>("deals");
  const wonDeals = deals.filter((deal) => deal.status === "Won");

  return {
    totalRevenue: calculateSum(wonDeals.map((deal) => deal.value)),
    totalDeals: deals.length,
    wonDeals: wonDeals.length,
    lostDeals: deals.filter((deal) => deal.status === "Lost").length,
    openDeals: deals.filter((deal) => deal.status === "Open").length,
    averageDealValue:
      wonDeals.length > 0
        ? calculateSum(wonDeals.map((deal) => deal.value)) / wonDeals.length
        : 0,
    revenueByMonth: generateMonthlySeries(
      wonDeals,
      "closeDate",
      "value"
    ),
  };
}

export function getPipelineReport() {
  const deals = getAll<any>("deals");
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
        totalValue: calculateSum(stageDeals.map((deal) => deal.value)),
      };
    })
    .filter((stage) => stage.count > 0);

  return {
    pipelineTotal: calculateSum(
      deals
        .filter((deal) => deal.status === "Open")
        .map((deal) => deal.value)
    ),
    stageBreakdown,
  };
}

export function getLeadReport() {
  const leads = getAll<any>("leads");
  const sources = [...new Set(leads.map((lead) => lead.source))];

  return {
    totalLeads: leads.length,
    activeLeads: leads.filter((lead) => lead.status === "Active").length,
    convertedLeads: leads.filter((lead) => lead.status === "Converted").length,
    lostLeads: leads.filter((lead) => lead.status === "Lost").length,
    leadsBySource: sources.map((source) => ({
      source,
      count: leads.filter((lead) => lead.source === source).length,
    })),
    leadsByStage: [
      ...new Set(leads.map((lead) => lead.stage)),
    ].map((stage) => ({
      stage,
      count: leads.filter((lead) => lead.stage === stage).length,
    })),
  };
}

export function getTeamReport() {
  const users = getAll<any>("users");
  const deals = getAll<any>("deals");
  const leads = getAll<any>("leads");
  const tasks = getAll<any>("tasks");

  return users.map((user) => ({
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
    leadsCount: leads.filter((lead) => lead.ownerId === user.id).length,
    tasksCompleted: tasks.filter(
      (task) => task.assigneeId === user.id && task.status === "Done"
    ).length,
  }));
}
