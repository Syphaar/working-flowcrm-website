import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Returns a date that is `days` days in the past.
 */
function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 86400000);
}

/**
 * Returns a date that is `days` days in the future.
 */
function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 86400000);
}

/**
 * Returns a date that is `minutes` minutes in the past.
 */
function minutesAgo(minutes: number): Date {
  return new Date(Date.now() - minutes * 60000);
}

async function seed() {
  console.log("Clearing existing data...");
  await prisma.passwordResetToken.deleteMany();
  await prisma.teamGoal.deleteMany();
  await prisma.fileAttachment.deleteMany();
  await prisma.note.deleteMany();
  await prisma.message.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.calendarEvent.deleteMany();
  await prisma.task.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.company.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.pipeline.deleteMany();
  await prisma.role.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.user.deleteMany();

  // ─────────────────────────────────────────────
  //  ROLES
  // ─────────────────────────────────────────────
  console.log("Seeding roles...");
  const createdRoles = await Promise.all([
    prisma.role.create({
      data: {
        id: "role_super_admin",
        name: "super_admin",
        description: "Full system access with all permissions",
        permissions: [
          "view_leads", "edit_leads", "delete_leads",
          "manage_customers", "manage_deals",
          "view_revenue", "manage_reports",
          "manage_users", "manage_roles", "send_notifications", "view_audit",
        ],
        createdAt: daysAgo(400),
        updatedAt: daysAgo(1),
      },
    }),
    prisma.role.create({
      data: {
        id: "role_manager",
        name: "manager",
        description: "Can manage team and view reports",
        permissions: [
          "view_leads", "edit_leads",
          "manage_customers", "manage_deals",
          "view_revenue", "manage_reports", "send_notifications", "view_audit",
        ],
        createdAt: daysAgo(400),
        updatedAt: daysAgo(1),
      },
    }),
    prisma.role.create({
      data: {
        id: "role_sales_executive",
        name: "sales_executive",
        description: "Can manage leads, customers, and deals",
        permissions: ["view_leads", "edit_leads", "manage_customers", "manage_deals"],
        createdAt: daysAgo(400),
        updatedAt: daysAgo(1),
      },
    }),
    prisma.role.create({
      data: {
        id: "role_marketing",
        name: "marketing",
        description: "Can view leads and send notifications",
        permissions: ["view_leads", "edit_leads", "send_notifications"],
        createdAt: daysAgo(400),
        updatedAt: daysAgo(1),
      },
    }),
  ]);
  console.log(`  Created ${createdRoles.length} roles`);

  // ─────────────────────────────────────────────
  //  PERMISSIONS
  // ─────────────────────────────────────────────
  console.log("Seeding permissions...");
  const permissionRecords = [
    { id: "perm_view_leads", name: "view_leads", description: "View leads in the system" },
    { id: "perm_edit_leads", name: "edit_leads", description: "Create and edit leads" },
    { id: "perm_delete_leads", name: "delete_leads", description: "Delete leads" },
    { id: "perm_manage_customers", name: "manage_customers", description: "Manage customer records" },
    { id: "perm_manage_deals", name: "manage_deals", description: "Manage deals pipeline" },
    { id: "perm_view_revenue", name: "view_revenue", description: "View revenue data" },
    { id: "perm_manage_reports", name: "manage_reports", description: "Create and manage reports" },
    { id: "perm_manage_users", name: "manage_users", description: "Manage user accounts" },
    { id: "perm_manage_roles", name: "manage_roles", description: "Manage roles and permissions" },
    { id: "perm_send_notifications", name: "send_notifications", description: "Send notifications" },
    { id: "perm_view_audit", name: "view_audit", description: "View audit log" },
  ];
  for (const permission of permissionRecords) {
    await prisma.permission.create({ data: { ...permission, createdAt: daysAgo(400) } });
  }
  console.log(`  Created ${permissionRecords.length} permissions`);

  // ─────────────────────────────────────────────
  //  PIPELINES
  // ─────────────────────────────────────────────
  console.log("Seeding pipelines...");
  await prisma.pipeline.createMany({
    data: [
      {
        id: "pl_default",
        name: "Default Pipeline",
        stages: ["New Lead", "Contacted", "Qualified", "Proposal Sent", "Negotiation", "Won", "Lost"],
        description: "Standard lead-to-deal pipeline",
        createdAt: daysAgo(400),
        updatedAt: daysAgo(1),
      },
      {
        id: "pl_enterprise",
        name: "Enterprise Sales",
        stages: ["Discovery", "Demo", "Evaluation", "Contract", "Closed Won", "Closed Lost"],
        description: "Enterprise sales cycle for large accounts",
        createdAt: daysAgo(300),
        updatedAt: daysAgo(1),
      },
    ],
  });
  console.log("  Created 2 pipelines");

  // ─────────────────────────────────────────────
  //  USERS (3 primary accounts)
  //    Each user gets 2 seed records per entity.
  // ─────────────────────────────────────────────
  const superAdminPassword = await bcrypt.hash("SuperAdmin123", 10);
  const salesPassword = await bcrypt.hash("TeamMember123", 10);
  const marketingPassword = await bcrypt.hash("Sifon123", 10);

  console.log("Seeding users...");
  const superAdminUser = await prisma.user.create({
    data: {
      id: "user_super_admin",
      name: "Alex Morgan",
      email: "superadmin@flowcrm.com",
      password: superAdminPassword,
      phone: "+1 (555) 100-2000",
      department: "Executive",
      role: "super_admin",
      roles: ["super_admin"],
      status: "online",
      lastActive: minutesAgo(2),
      lastLogin: minutesAgo(5),
      lastLogout: daysAgo(1),
      createdAt: daysAgo(400),
    },
  });

  const salesUser = await prisma.user.create({
    data: {
      id: "user_sales_executive",
      name: "Jordan Rivera",
      email: "sales@flowcrm.com",
      password: salesPassword,
      phone: "+1 (555) 200-3000",
      department: "Sales",
      role: "sales_executive",
      roles: ["sales_executive"],
      status: "online",
      lastActive: minutesAgo(8),
      lastLogin: minutesAgo(20),
      lastLogout: daysAgo(1),
      createdAt: daysAgo(300),
    },
  });

  const marketingUser = await prisma.user.create({
    data: {
      id: "user_sifon",
      name: "Sifon Udoh",
      email: "sifon@gmail.com",
      password: marketingPassword,
      phone: "+1 (555) 300-4000",
      department: "Marketing",
      role: "marketing",
      roles: ["marketing"],
      status: "online",
      lastActive: minutesAgo(15),
      lastLogin: minutesAgo(30),
      lastLogout: daysAgo(2),
      createdAt: daysAgo(200),
    },
  });

  const allUsers = [superAdminUser, salesUser, marketingUser];
  console.log(`  Created ${allUsers.length} users`);

  // ─────────────────────────────────────────────
  //  LEADS  (2 per user = 6 total)
  // ─────────────────────────────────────────────
  console.log("Seeding leads...");
  const leads = [
    { id: "lead_a1", name: "Sarah Chen", company: "NovaTech Solutions", email: "sarah.chen@novatech.com", phone: "+1 (555) 101-1001", source: "Website", stage: "New_Lead" as const, status: "Active" as const, ownerId: superAdminUser.id, value: 45000, notes: "Interested in enterprise plan with AI features", tags: ["enterprise", "hot"] },
    { id: "lead_a2", name: "Marcus Johnson", company: "Quantum Forge", email: "marcus.j@quantumforge.io", phone: "+1 (555) 101-1002", source: "LinkedIn", stage: "Contacted" as const, status: "Active" as const, ownerId: superAdminUser.id, value: 28000, notes: "Requested demo for Q2 budget cycle", tags: ["follow-up"] },
    { id: "lead_b1", name: "Emily Rodriguez", company: "Vertex Dynamics", email: "emily.r@vertexdyn.com", phone: "+1 (555) 201-2001", source: "Referral", stage: "Qualified" as const, status: "Active" as const, ownerId: salesUser.id, value: 62000, notes: "Decision maker engaged, needs proposal by Friday", tags: ["vip", "priority"] },
    { id: "lead_b2", name: "David Kim", company: "Helix Innovations", email: "david.kim@helixinc.com", phone: "+1 (555) 201-2002", source: "Cold Email", stage: "New_Lead" as const, status: "Active" as const, ownerId: salesUser.id, value: 15000, notes: "Small business interested in basic plan", tags: ["smb"] },
    { id: "lead_c1", name: "Aisha Patel", company: "Strata Technologies", email: "aisha.p@stratech.com", phone: "+1 (555) 301-3001", source: "Webinar", stage: "Proposal_Sent" as const, status: "Active" as const, ownerId: marketingUser.id, value: 35000, notes: "Proposal sent, awaiting procurement approval", tags: ["follow-up", "enterprise"] },
    { id: "lead_c2", name: "Tomás Silva", company: "Cogent Systems", email: "t.silva@cogent.sys", phone: "+1 (555) 301-3002", source: "Ad Campaign", stage: "Contacted" as const, status: "Active" as const, ownerId: marketingUser.id, value: 12000, notes: "Called twice, left voicemail", tags: ["cold"] },
  ];
  for (const lead of leads) {
    await prisma.lead.create({ data: { ...lead, createdAt: daysAgo(15), updatedAt: daysAgo(2) } });
  }
  console.log(`  Created ${leads.length} leads`);

  // ─────────────────────────────────────────────
  //  COMPANIES  (2 per user = 6 total)
  // ─────────────────────────────────────────────
  console.log("Seeding companies...");
  const companies = [
    { id: "comp_a1", name: "NovaTech Solutions", industry: "Software", website: "https://novatech.com", address: "1200 Market St, San Francisco, CA", revenue: 25000000, employees: 350, status: "Active" as const, ownerId: superAdminUser.id },
    { id: "comp_a2", name: "Quantum Forge", industry: "Manufacturing", website: "https://quantumforge.io", address: "4500 Innovation Dr, Austin, TX", revenue: 85000000, employees: 1200, status: "Active" as const, ownerId: superAdminUser.id },
    { id: "comp_b1", name: "Vertex Dynamics", industry: "Healthcare", website: "https://vertexdyn.com", address: "800 Health Blvd, Boston, MA", revenue: 120000000, employees: 2500, status: "Prospect" as const, ownerId: salesUser.id },
    { id: "comp_b2", name: "Helix Innovations", industry: "Biotech", website: "https://helixinc.com", address: "300 Research Way, San Diego, CA", revenue: 55000000, employees: 800, status: "Active" as const, ownerId: salesUser.id },
    { id: "comp_c1", name: "Strata Technologies", industry: "Software", website: "https://stratech.com", address: "750 Tech Park Dr, Seattle, WA", revenue: 42000000, employees: 500, status: "Active" as const, ownerId: marketingUser.id },
    { id: "comp_c2", name: "Cogent Systems", industry: "Finance", website: "https://cogent.sys", address: "200 Wall St, New York, NY", revenue: 95000000, employees: 1800, status: "Inactive" as const, ownerId: marketingUser.id },
  ];
  for (const company of companies) {
    await prisma.company.create({ data: { ...company, createdAt: daysAgo(200), updatedAt: daysAgo(5) } });
  }
  console.log(`  Created ${companies.length} companies`);

  // ─────────────────────────────────────────────
  //  CONTACTS  (2 per user = 6 total)
  // ─────────────────────────────────────────────
  console.log("Seeding contacts...");
  const contacts = [
    { id: "cont_a1", name: "Dr. Lisa Wong", email: "l.wong@novatech.com", phone: "+1 (555) 101-2001", companyId: "comp_a1", company: "NovaTech Solutions", title: "CTO", ownerId: superAdminUser.id, tags: ["decision-maker"] },
    { id: "cont_a2", name: "James Mitchell", email: "j.mitchell@quantumforge.io", phone: "+1 (555) 101-2002", companyId: "comp_a2", company: "Quantum Forge", title: "VP Engineering", ownerId: superAdminUser.id, tags: ["technical"] },
    { id: "cont_b1", name: "Rachel Green", email: "r.green@vertexdyn.com", phone: "+1 (555) 201-3001", companyId: "comp_b1", company: "Vertex Dynamics", title: "CEO", ownerId: salesUser.id, tags: ["vip", "decision-maker"] },
    { id: "cont_b2", name: "Michael Park", email: "m.park@helixinc.com", phone: "+1 (555) 201-3002", companyId: "comp_b2", company: "Helix Innovations", title: "Procurement Manager", ownerId: salesUser.id, tags: ["procurement"] },
    { id: "cont_c1", name: "Olivia Brown", email: "o.brown@stratech.com", phone: "+1 (555) 301-4001", companyId: "comp_c1", company: "Strata Technologies", title: "Head of Product", ownerId: marketingUser.id, tags: ["product"] },
    { id: "cont_c2", name: "Carlos Mendez", email: "c.mendez@cogent.sys", phone: "+1 (555) 301-4002", companyId: "comp_c2", company: "Cogent Systems", title: "CFO", ownerId: marketingUser.id, tags: ["finance"] },
  ];
  for (const contact of contacts) {
    await prisma.contact.create({ data: { ...contact, createdAt: daysAgo(100), updatedAt: daysAgo(3) } });
  }
  console.log(`  Created ${contacts.length} contacts`);

  // ─────────────────────────────────────────────
  //  CUSTOMERS  (2 per user = 6 total)
  // ─────────────────────────────────────────────
  console.log("Seeding customers...");
  const customers = [
    { id: "cust_a1", name: "Acme Corp", company: "Acme Corp", email: "billing@acmecorp.com", phone: "+1 (555) 101-3001", status: "VIP" as const, totalSpend: 450000, ownerId: superAdminUser.id },
    { id: "cust_a2", name: "Pied Piper", company: "Pied Piper", email: "ops@piedpiper.com", phone: "+1 (555) 101-3002", status: "Active" as const, totalSpend: 185000, ownerId: superAdminUser.id },
    { id: "cust_b1", name: "Stark Industries", company: "Stark Industries", email: "procurement@stark.com", phone: "+1 (555) 201-4001", status: "VIP" as const, totalSpend: 920000, ownerId: salesUser.id },
    { id: "cust_b2", name: "Wayne Enterprises", company: "Wayne Enterprises", email: "finance@wayne.com", phone: "+1 (555) 201-4002", status: "Active" as const, totalSpend: 310000, ownerId: salesUser.id },
    { id: "cust_c1", name: "Globex Corporation", company: "Globex Corporation", email: "accounts@globex.com", phone: "+1 (555) 301-5001", status: "At_Risk" as const, totalSpend: 75000, ownerId: marketingUser.id },
    { id: "cust_c2", name: "Initech", company: "Initech", email: "billing@initech.com", phone: "+1 (555) 301-5002", status: "Active" as const, totalSpend: 120000, ownerId: marketingUser.id },
  ];
  for (const customer of customers) {
    await prisma.customer.create({ data: { ...customer, createdAt: daysAgo(300), updatedAt: daysAgo(7) } });
  }
  console.log(`  Created ${customers.length} customers`);

  // ─────────────────────────────────────────────
  //  DEALS  (2 per user = 6 total)
  // ─────────────────────────────────────────────
  console.log("Seeding deals...");
  const deals = [
    { id: "deal_a1", name: "NovaTech — Enterprise License", customerId: "cust_a1", customerName: "Acme Corp", value: 180000, stage: "Negotiation" as const, status: "Open" as const, priority: "High" as const, probability: 75, ownerId: superAdminUser.id, closeDate: daysFromNow(30) },
    { id: "deal_a2", name: "Pied Piper — Expansion", customerId: "cust_a2", customerName: "Pied Piper", value: 95000, stage: "Proposal_Sent" as const, status: "Open" as const, priority: "Medium" as const, probability: 60, ownerId: superAdminUser.id, closeDate: daysFromNow(45) },
    { id: "deal_b1", name: "Stark — Annual Renewal", customerId: "cust_b1", customerName: "Stark Industries", value: 250000, stage: "Won" as const, status: "Won" as const, priority: "High" as const, probability: 100, ownerId: salesUser.id, closeDate: daysAgo(5) },
    { id: "deal_b2", name: "Wayne — Pilot Program", customerId: "cust_b2", customerName: "Wayne Enterprises", value: 65000, stage: "Qualified" as const, status: "Open" as const, priority: "Medium" as const, probability: 45, ownerId: salesUser.id, closeDate: daysFromNow(60) },
    { id: "deal_c1", name: "Globex — Reactivation", customerId: "cust_c1", customerName: "Globex Corporation", value: 35000, stage: "Contacted" as const, status: "Open" as const, priority: "Urgent" as const, probability: 30, ownerId: marketingUser.id, closeDate: daysFromNow(15) },
    { id: "deal_c2", name: "Initech — Upsell", customerId: "cust_c2", customerName: "Initech", value: 42000, stage: "New_Lead" as const, status: "Open" as const, priority: "Low" as const, probability: 20, ownerId: marketingUser.id, closeDate: daysFromNow(90) },
  ];
  for (const deal of deals) {
    await prisma.deal.create({ data: { ...deal, createdAt: daysAgo(30), updatedAt: daysAgo(1) } });
  }
  console.log(`  Created ${deals.length} deals`);

  // ─────────────────────────────────────────────
  //  TASKS  (2 per user = 6 total)
  // ─────────────────────────────────────────────
  console.log("Seeding tasks...");
  const tasks = [
    { id: "task_a1", name: "Follow up on Novatech proposal", description: "Send revised pricing and case studies to Sarah Chen", priority: "High" as const, dueDate: daysFromNow(3), status: "Open" as const, assigneeId: superAdminUser.id },
    { id: "task_a2", name: "Prepare quarterly review deck", description: "Compile Q1 metrics for executive presentation", priority: "Medium" as const, dueDate: daysFromNow(7), status: "In_Progress" as const, assigneeId: superAdminUser.id },
    { id: "task_b1", name: "Schedule demo for Vertex Dynamics", description: "Coordinate with Rachel Green for product demo", priority: "High" as const, dueDate: daysFromNow(2), status: "Open" as const, assigneeId: salesUser.id },
    { id: "task_b2", name: "Send contract to Stark Industries", description: "Finalize and send annual renewal contract", priority: "Urgent" as const, dueDate: daysFromNow(1), status: "Open" as const, assigneeId: salesUser.id },
    { id: "task_c1", name: "Create email campaign for reactivation", description: "Design email sequence for at-risk customers", priority: "Medium" as const, dueDate: daysFromNow(10), status: "Done" as const, assigneeId: marketingUser.id },
    { id: "task_c2", name: "Update marketing collateral", description: "Refresh product brochures and case studies", priority: "Low" as const, dueDate: daysFromNow(14), status: "Open" as const, assigneeId: marketingUser.id },
  ];
  for (const task of tasks) {
    await prisma.task.create({ data: { ...task, createdAt: daysAgo(5), updatedAt: daysAgo(1) } });
  }
  console.log(`  Created ${tasks.length} tasks`);

  // ─────────────────────────────────────────────
  //  CALENDAR EVENTS  (2 per user = 6 total)
  // ─────────────────────────────────────────────
  console.log("Seeding calendar events...");
  const events = [
    { id: "evt_a1", title: "NovaTech Strategy Sync", description: "Quarterly review with NovaTech leadership", startsAt: daysFromNow(5), attendees: [superAdminUser.id, salesUser.id], recurrence: "none" as const, status: "Scheduled" as const },
    { id: "evt_a2", title: "Product Roadmap Review", description: "Internal product roadmap alignment meeting", startsAt: daysFromNow(2), attendees: [superAdminUser.id], recurrence: "weekly" as const, status: "Scheduled" as const },
    { id: "evt_b1", title: "Vertex Discovery Call", description: "Initial discovery call with Vertex Dynamics team", startsAt: daysFromNow(3), attendees: [salesUser.id, superAdminUser.id], recurrence: "none" as const, status: "Scheduled" as const },
    { id: "evt_b2", title: "Stark Renewal Meeting", description: "Annual renewal discussion with Stark procurement", startsAt: daysAgo(3), attendees: [salesUser.id], recurrence: "none" as const, status: "Completed" as const },
    { id: "evt_c1", title: "Marketing Campaign Launch", description: "Go-live for Q2 email campaign", startsAt: daysFromNow(7), attendees: [marketingUser.id], recurrence: "none" as const, status: "Scheduled" as const },
    { id: "evt_c2", title: "Monthly All-Hands", description: "Company-wide monthly update", startsAt: daysFromNow(12), attendees: [superAdminUser.id, salesUser.id, marketingUser.id], recurrence: "monthly" as const, status: "Scheduled" as const },
  ];
  for (const event of events) {
    const startTime = event.startsAt;
    const endTime = new Date(startTime.getTime() + 60 * 60000);
    await prisma.calendarEvent.create({
      data: {
        ...event,
        startsAt: startTime,
        endsAt: endTime,
        createdAt: daysAgo(10),
        updatedAt: daysAgo(1),
      },
    });
  }
  console.log(`  Created ${events.length} events`);

  // ─────────────────────────────────────────────
  //  NOTIFICATIONS  (2 per user = 6 total)
  // ─────────────────────────────────────────────
  console.log("Seeding notifications...");
  const notifications = [
    { id: "notif_a1", title: "New deal opportunity", message: "A new high-value deal has been added to your pipeline.", senderId: salesUser.id, senderName: salesUser.name, recipientId: superAdminUser.id, read: false, type: "info" as const },
    { id: "notif_a2", title: "Task overdue", message: "Your quarterly review deck task is now overdue.", senderId: superAdminUser.id, senderName: superAdminUser.name, recipientId: superAdminUser.id, read: true, type: "warning" as const },
    { id: "notif_b1", title: "Deal won!", message: "Stark Industries renewal has been closed won. Congratulations!", senderId: superAdminUser.id, senderName: superAdminUser.name, recipientId: salesUser.id, read: false, type: "success" as const },
    { id: "notif_b2", title: "Demo scheduled", message: "A product demo has been scheduled with Vertex Dynamics.", senderId: salesUser.id, senderName: salesUser.name, recipientId: salesUser.id, read: true, type: "info" as const },
    { id: "notif_c1", title: "Campaign ready for review", message: "Your Q2 email campaign is ready for final review.", senderId: superAdminUser.id, senderName: superAdminUser.name, recipientId: marketingUser.id, read: false, type: "info" as const },
    { id: "notif_c2", title: "Customer at risk", message: "Globex Corporation is showing signs of churn.", senderId: salesUser.id, senderName: salesUser.name, recipientId: marketingUser.id, read: false, type: "danger" as const },
  ];
  for (const notification of notifications) {
    await prisma.notification.create({ data: { ...notification, createdAt: minutesAgo(60) } });
  }
  console.log(`  Created ${notifications.length} notifications`);

  // ─────────────────────────────────────────────
  //  NOTES  (2 per user = 6 total)
  // ─────────────────────────────────────────────
  console.log("Seeding notes...");
  const notes = [
    { id: "note_a1", authorId: superAdminUser.id, authorName: superAdminUser.name, body: "Great fit for enterprise tier. Strong alignment with AI roadmap.", entity: "lead", entityId: "lead_a1" },
    { id: "note_a2", authorId: superAdminUser.id, authorName: superAdminUser.name, body: "Decision expected next week after board approval.", entity: "deal", entityId: "deal_a1" },
    { id: "note_b1", authorId: salesUser.id, authorName: salesUser.name, body: "Champion identified. CEO is very enthusiastic about the platform.", entity: "contact", entityId: "cont_b1" },
    { id: "note_b2", authorId: salesUser.id, authorName: salesUser.name, body: "Needs procurement signoff before we can proceed.", entity: "deal", entityId: "deal_b2" },
    { id: "note_c1", authorId: marketingUser.id, authorName: marketingUser.name, body: "Concerns about pricing. Sent revised proposal.", entity: "customer", entityId: "cust_c1" },
    { id: "note_c2", authorId: marketingUser.id, authorName: marketingUser.name, body: "Follow up in 2 weeks regarding expansion opportunity.", entity: "lead", entityId: "lead_c1" },
  ];
  for (const note of notes) {
    await prisma.note.create({ data: { ...note, createdAt: daysAgo(3), updatedAt: daysAgo(1) } });
  }
  console.log(`  Created ${notes.length} notes`);

  // ─────────────────────────────────────────────
  //  FILE ATTACHMENTS  (2 per user = 6 total)
  // ─────────────────────────────────────────────
  console.log("Seeding attachments...");
  const attachments = [
    { id: "att_a1", name: "Enterprise_Proposal.pdf", size: 2450000, type: "application/pdf", entity: "lead", entityId: "lead_a1", uploaderId: superAdminUser.id },
    { id: "att_a2", name: "Q1_Review_Deck.pptx", size: 5200000, type: "application/vnd.openxmlformats-officedocument.presentationml.presentation", entity: "deal", entityId: "deal_a1", uploaderId: superAdminUser.id },
    { id: "att_b1", name: "NDA_Vertex.pdf", size: 180000, type: "application/pdf", entity: "contact", entityId: "cont_b1", uploaderId: salesUser.id },
    { id: "att_b2", name: "Stark_Renewal_Contract.pdf", size: 890000, type: "application/pdf", entity: "deal", entityId: "deal_b1", uploaderId: salesUser.id },
    { id: "att_c1", name: "Campaign_Brief.docx", size: 420000, type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", entity: "customer", entityId: "cust_c1", uploaderId: marketingUser.id },
    { id: "att_c2", name: "Product_Brochure_2026.pdf", size: 3100000, type: "application/pdf", entity: "lead", entityId: "lead_c1", uploaderId: marketingUser.id },
  ];
  for (const attachment of attachments) {
    await prisma.fileAttachment.create({ data: { ...attachment, createdAt: daysAgo(7) } });
  }
  console.log(`  Created ${attachments.length} attachments`);

  // ─────────────────────────────────────────────
  //  COMMUNICATIONS  (2 per user = 6 total)
  // ─────────────────────────────────────────────
  console.log("Seeding communications...");
  const communications = [
    { id: "comm_a1", channel: "email" as const, fromId: superAdminUser.id, fromName: superAdminUser.name, toId: salesUser.id, toName: salesUser.name, subject: "Re: Novatech pricing", body: "I've updated the pricing tiers. Please send to Sarah for review." },
    { id: "comm_a2", channel: "internal" as const, fromId: superAdminUser.id, fromName: superAdminUser.name, toId: superAdminUser.id, toName: superAdminUser.name, subject: "Note to self", body: "Prepare board deck for Friday's meeting." },
    { id: "comm_b1", channel: "email" as const, fromId: salesUser.id, fromName: salesUser.name, toId: superAdminUser.id, toName: superAdminUser.name, subject: "Stark renewal signed!", body: "Great news — Stark Industries has signed the renewal. Details attached." },
    { id: "comm_b2", channel: "call" as const, fromId: salesUser.id, fromName: salesUser.name, toId: marketingUser.id, toName: marketingUser.name, subject: undefined, body: "Discussed customer reactivation strategy for Globex." },
    { id: "comm_c1", channel: "email" as const, fromId: marketingUser.id, fromName: marketingUser.name, toId: superAdminUser.id, toName: superAdminUser.name, subject: "Campaign ready for review", body: "The Q2 email sequence is ready. Can you take a look before we launch?" },
    { id: "comm_c2", channel: "sms" as const, fromId: marketingUser.id, fromName: marketingUser.name, toId: salesUser.id, toName: salesUser.name, subject: undefined, body: "Got Globex feedback — they're considering the new proposal." },
  ];
  for (const communication of communications) {
    await prisma.message.create({ data: { ...communication, createdAt: minutesAgo(120) } });
  }
  console.log(`  Created ${communications.length} communications`);

  // ─────────────────────────────────────────────
  //  ACTIVITIES  (2 per user = 6 total)
  // ─────────────────────────────────────────────
  console.log("Seeding activities...");
  const activities = [
    { id: "act_a1", userId: superAdminUser.id, userName: superAdminUser.name, role: "super_admin" as const, kind: "create", entity: "Lead", entityId: "lead_a1", description: "Alex Morgan created a new lead: Sarah Chen" },
    { id: "act_a2", userId: superAdminUser.id, userName: superAdminUser.name, role: "super_admin" as const, kind: "login", description: "Alex Morgan logged into the system" },
    { id: "act_b1", userId: salesUser.id, userName: salesUser.name, role: "sales_executive" as const, kind: "stage_change", entity: "Deal", entityId: "deal_b1", description: "Jordan Rivera moved Stark Renewal to Won" },
    { id: "act_b2", userId: salesUser.id, userName: salesUser.name, role: "sales_executive" as const, kind: "assign", entity: "Task", entityId: "task_b1", description: "Jordan Rivera assigned demo task to themselves" },
    { id: "act_c1", userId: marketingUser.id, userName: marketingUser.name, role: "marketing" as const, kind: "create", entity: "Customer", entityId: "cust_c1", description: "Sifon Udoh created a new campaign for Globex" },
    { id: "act_c2", userId: marketingUser.id, userName: marketingUser.name, role: "marketing" as const, kind: "complete", entity: "Task", entityId: "task_c1", description: "Sifon Udoh completed the email campaign task" },
  ];
  for (const activity of activities) {
    await prisma.activity.create({ data: { ...activity, createdAt: minutesAgo(30) } });
  }
  console.log(`  Created ${activities.length} activities`);

  // ─────────────────────────────────────────────
  //  SUMMARY
  // ─────────────────────────────────────────────
  console.log("─".repeat(50));
  console.log("Seed complete!");
  console.log("─".repeat(50));
  console.log("  Users:");
  console.log("    superadmin@flowcrm.com / SuperAdmin123  (Alex Morgan — super_admin)");
  console.log("    sales@flowcrm.com / TeamMember123        (Jordan Rivera — sales_executive)");
  console.log("    sifon@gmail.com / Sifon123               (Sifon Udoh — marketing)");
  console.log("─".repeat(50));
}

seed()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
