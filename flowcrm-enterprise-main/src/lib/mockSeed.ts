import type {
  User,
  Lead,
  Contact,
  Company,
  Customer,
  Deal,
  Activity,
  Task,
  CalendarEvent,
  Notification,
  Note,
  Attachment,
  Communication,
  Role,
  LeadStage,
} from "./types";

// Deterministic PRNG
function mulberry32(seed: number) {
  return function () {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(20260612);
const pick = <T>(arr: readonly T[]) => arr[Math.floor(rnd() * arr.length)];
const between = (min: number, max: number) => Math.floor(rnd() * (max - min + 1)) + min;
const id = (prefix: string, index: number) =>
  `${prefix}_${(index + 1).toString().padStart(4, "0")}`;
const daysAgo = (days: number) => new Date(Date.now() - days * 86400000).toISOString();
const minsAgo = (minutes: number) => new Date(Date.now() - minutes * 60000).toISOString();
const daysFromNow = (days: number) => new Date(Date.now() + days * 86400000).toISOString();

const FIRST = [
  "Aarav",
  "Liam",
  "Olivia",
  "Noah",
  "Emma",
  "Sophia",
  "Mateo",
  "Aria",
  "Yuki",
  "Chen",
  "Priya",
  "Ravi",
  "Aisha",
  "Diego",
  "Maya",
  "Leo",
  "Zara",
  "Amir",
  "Nora",
  "Eli",
  "Hannah",
  "Jin",
  "Luca",
  "Mei",
  "Omar",
  "Sara",
  "Tariq",
  "Wei",
  "Yara",
  "Ivan",
  "Anya",
  "Kofi",
  "Rosa",
  "Ahmed",
  "Lina",
  "Dmitri",
  "Hugo",
  "Sana",
  "Tomas",
  "Aiko",
];
const LAST = [
  "Sharma",
  "Patel",
  "Chen",
  "Garcia",
  "Rodriguez",
  "Kim",
  "Lee",
  "Brown",
  "Smith",
  "Wang",
  "Khan",
  "Singh",
  "Liu",
  "Tanaka",
  "Nguyen",
  "Silva",
  "Diaz",
  "Ali",
  "Cohen",
  "Park",
  "Hassan",
  "Okafor",
  "Mendes",
  "Petrov",
  "Yamamoto",
  "Davis",
  "Wright",
  "Jones",
  "Carter",
  "Mehta",
  "Iyer",
  "Rao",
  "Reddy",
  "Bose",
  "Das",
  "Ng",
  "Tran",
  "Bauer",
  "Schmidt",
  "Rossi",
];
const COMPANIES = [
  "Acme Corp",
  "Globex",
  "Initech",
  "Umbrella",
  "Stark Industries",
  "Wayne Enterprises",
  "Wonka",
  "Cyberdyne",
  "Aperture",
  "Hooli",
  "Pied Piper",
  "Massive Dynamic",
  "Soylent",
  "Tyrell",
  "Oscorp",
  "Lexcorp",
  "Vandelay",
  "Sterling Cooper",
  "Dunder Mifflin",
  "Gringotts",
  "Black Mesa",
  "Vault-Tec",
  "Weyland",
  "Nakatomi",
  "Bluebook",
  "Encom",
  "Krusty Krab",
  "MomCorp",
  "Yoyodyne",
  "Vector",
  "Northrop",
  "Helios",
  "Tessier-Ashpool",
  "Cyrez",
  "Massive Beam",
  "Quantum Forge",
  "Lumen",
  "Nimbus",
  "Helix",
  "Strata",
  "Cogent",
  "Apex",
  "Vertex",
  "Nova",
  "Echelon",
  "Catalyst",
  "Sapient",
  "Vanta",
  "Nimble",
  "Solstice",
];
const INDUSTRIES = [
  "Software",
  "Finance",
  "Healthcare",
  "Retail",
  "Manufacturing",
  "Education",
  "Energy",
  "Logistics",
  "Real Estate",
  "Media",
];
const SOURCES = [
  "Website",
  "Referral",
  "LinkedIn",
  "Cold Email",
  "Event",
  "Partner",
  "Ad Campaign",
  "Webinar",
];
const TAGS = [
  "enterprise",
  "smb",
  "priority",
  "hot",
  "cold",
  "follow-up",
  "vip",
  "trial",
  "onboarding",
  "expansion",
];
const STAGES: LeadStage[] = [
  "New Lead",
  "Contacted",
  "Qualified",
  "Proposal Sent",
  "Negotiation",
  "Won",
  "Lost",
];
const DEPARTMENTS = ["Sales", "Marketing", "Support", "Operations", "Finance", "Engineering"];

const fullName = () => `${pick(FIRST)} ${pick(LAST)}`;
const email = (name: string, company: string) =>
  `${name.toLowerCase().replace(/[^a-z]/g, ".")}@${company.toLowerCase().replace(/[^a-z]/g, "")}.com`;
const phone = () => `+1 (${between(200, 999)}) ${between(100, 999)}-${between(1000, 9999)}`;

export function buildSeed() {
  // Users — 15
  const users: User[] = [
    {
      id: "u_super",
      name: "Alex Morgan",
      email: "superadmin@flowcrm.com",
      password: "SuperAdmin123",
      phone: phone(),
      department: "Executive",
      role: "super_admin",
      roles: ["super_admin"],
      status: "online",
      lastActive: minsAgo(2),
      lastLogin: minsAgo(5),
      lastLogout: daysAgo(1),
      createdAt: daysAgo(400),
      twoFactor: false,
    },
    {
      id: "u_sales",
      name: "Jordan Rivera",
      email: "sales@flowcrm.com",
      password: "TeamMember123",
      phone: phone(),
      department: "Sales",
      role: "sales_executive",
      roles: ["sales_executive"],
      status: "online",
      lastActive: minsAgo(8),
      lastLogin: minsAgo(20),
      lastLogout: daysAgo(1),
      createdAt: daysAgo(300),
      twoFactor: false,
    },
  ];
  for (let i = 0; i < 13; i++) {
    const name = fullName();
    const role: Role =
      i < 2 ? "manager" : i < 6 ? "sales_executive" : i < 9 ? "marketing" : "sales_executive";
    users.push({
      id: id("u", i + 2),
      name,
      email: email(name, "flowcrm"),
      password: "Demo123",
      phone: phone(),
      department: pick(DEPARTMENTS),
      role,
      roles: [role],
      status: pick(["online", "away", "offline", "online"] as const),
      lastActive: minsAgo(between(1, 600)),
      lastLogin: daysAgo(between(0, 5)),
      lastLogout: daysAgo(between(0, 7)),
      createdAt: daysAgo(between(50, 500)),
    });
  }
  const ownerIds = users.map((user) => user.id);

  // Companies — 50
  const companies: Company[] = Array.from({ length: 50 }, (_, i) => {
    const name = `${COMPANIES[i % COMPANIES.length]}${i >= COMPANIES.length ? " " + (i - COMPANIES.length + 2) : ""}`;
    return {
      id: id("co", i),
      name,
      industry: pick(INDUSTRIES),
      website: `https://${name.toLowerCase().replace(/[^a-z]/g, "")}.com`,
      address: `${between(100, 9999)} ${pick(["Market", "Main", "Pine", "Oak", "King", "Cedar"])} St, ${pick(["NY", "SF", "LA", "Chicago", "Austin", "Seattle", "Boston", "Denver"])}`,
      revenue: between(100000, 50000000),
      employees: between(10, 5000),
      status: pick(["Active", "Prospect", "Active", "Active", "Inactive"] as const),
      ownerId: pick(ownerIds),
      createdAt: daysAgo(between(30, 600)),
      updatedAt: daysAgo(between(0, 30)),
    };
  });

  // Leads — 100
  const leads: Lead[] = Array.from({ length: 100 }, (_, i) => {
    const name = fullName();
    const company = pick(companies).name;
    return {
      id: id("ld", i),
      name,
      company,
      email: email(name, company),
      phone: phone(),
      source: pick(SOURCES),
      stage: pick(STAGES),
      status: pick(["Active", "Active", "Inactive", "Converted", "Lost"] as const),
      ownerId: pick(ownerIds),
      value: between(2000, 250000),
      notes: pick([
        "Interested in enterprise plan",
        "Requested demo",
        "Comparing competitors",
        "Budget approved Q1",
        "Decision maker engaged",
        "Awaiting proposal",
      ]),
      tags: [pick(TAGS), pick(TAGS)],
      createdAt: daysAgo(between(0, 180)),
      updatedAt: daysAgo(between(0, 20)),
    };
  });

  // Contacts — 100
  const contacts: Contact[] = Array.from({ length: 100 }, (_, i) => {
    const name = fullName();
    const company = pick(companies);
    return {
      id: id("ct", i),
      name,
      email: email(name, company.name),
      phone: phone(),
      companyId: company.id,
      company: company.name,
      title: pick([
        "CEO",
        "CTO",
        "VP Sales",
        "Director",
        "Manager",
        "Engineer",
        "Analyst",
        "Product Lead",
      ]),
      ownerId: pick(ownerIds),
      tags: [pick(TAGS)],
      createdAt: daysAgo(between(0, 300)),
      updatedAt: daysAgo(between(0, 30)),
    };
  });

  // Customers — 50
  const customers: Customer[] = Array.from({ length: 50 }, (_, i) => {
    const name = fullName();
    const company = pick(companies);
    return {
      id: id("cu", i),
      name,
      company: company.name,
      email: email(name, company.name),
      phone: phone(),
      status: pick(["Active", "Active", "VIP", "At Risk", "Churned"] as const),
      totalSpend: between(5000, 500000),
      ownerId: pick(ownerIds),
      createdAt: daysAgo(between(30, 700)),
      updatedAt: daysAgo(between(0, 14)),
    };
  });

  // Deals — 40
  const deals: Deal[] = Array.from({ length: 40 }, (_, i) => {
    const customer = pick(customers);
    const stage = pick(STAGES);
    return {
      id: id("dl", i),
      name: `${customer.company} — ${pick(["Annual License", "Expansion", "Enterprise Plan", "Pilot", "Renewal", "Add-on"])}`,
      customerId: customer.id,
      customerName: customer.name,
      value: between(5000, 350000),
      stage,
      status: stage === "Won" ? "Won" : stage === "Lost" ? "Lost" : "Open",
      priority: pick(["Low", "Medium", "High", "Urgent"] as const),
      probability: stage === "Won" ? 100 : stage === "Lost" ? 0 : between(10, 90),
      ownerId: pick(ownerIds),
      closeDate: daysFromNow(between(-30, 90)),
      createdAt: daysAgo(between(0, 120)),
      updatedAt: daysAgo(between(0, 14)),
    };
  });

  // Tasks — 30
  const tasks: Task[] = Array.from({ length: 30 }, (_, i) => ({
    id: id("tk", i),
    name: pick([
      "Follow up call",
      "Send proposal",
      "Schedule demo",
      "Send contract",
      "Quarterly review",
      "Onboarding session",
      "Renewal discussion",
      "Discovery call",
    ]),
    description: "Auto-generated demo task.",
    priority: pick(["Low", "Medium", "High", "Urgent"] as const),
    dueDate: daysFromNow(between(-3, 21)),
    status: pick(["Open", "Open", "In Progress", "Done"] as const),
    assigneeId: pick(ownerIds),
    createdAt: daysAgo(between(0, 30)),
    updatedAt: daysAgo(between(0, 5)),
  }));

  // Calendar — 50
  const events: CalendarEvent[] = Array.from({ length: 50 }, (_, i) => {
    const start = daysFromNow(between(-7, 30));
    const startDate = new Date(start);
    return {
      id: id("ev", i),
      title: pick([
        "Discovery Call",
        "Product Demo",
        "Quarterly Review",
        "Onboarding",
        "Strategy Sync",
        "Pricing Discussion",
        "Stakeholder Meeting",
      ]),
      description: "Auto-generated event.",
      startsAt: start,
      endsAt: new Date(startDate.getTime() + between(30, 120) * 60000).toISOString(),
      attendees: [pick(ownerIds), pick(ownerIds)],
      recurrence: pick(["none", "none", "none", "weekly", "monthly"] as const),
      status: pick(["Scheduled", "Scheduled", "Completed"] as const),
      createdAt: daysAgo(between(1, 30)),
      updatedAt: daysAgo(between(0, 5)),
    };
  });

  // Notifications — 25
  const notifications: Notification[] = Array.from({ length: 25 }, (_, i) => {
    const sender = pick(users);
    return {
      id: id("nt", i),
      title: pick([
        "New deal assigned",
        "Customer renewed",
        "Task overdue",
        "Lead converted",
        "Quota update",
        "Welcome aboard",
        "Pipeline review",
        "Monthly report",
      ]),
      message: "This is a system-generated notification with relevant context for the recipient.",
      senderId: sender.id,
      senderName: sender.name,
      recipientId: pick(ownerIds),
      read: rnd() > 0.5,
      type: pick(["info", "success", "warning", "danger"] as const),
      createdAt: minsAgo(between(5, 5000)),
    };
  });

  // Activities — 100
  const kinds = [
    "create",
    "update",
    "login",
    "logout",
    "stage_change",
    "assign",
    "notification",
    "status_change",
  ] as const;
  const activities: Activity[] = Array.from({ length: 100 }, (_, i) => {
    const user = pick(users);
    const kind = pick(kinds);
    return {
      id: id("ac", i),
      userId: user.id,
      userName: user.name,
      role: user.role,
      kind,
      entity: pick(["Lead", "Deal", "Customer", "Contact", "Task"]),
      description: `${user.name} performed ${kind} on ${pick(["a lead", "a deal", "a customer", "a contact", "a task"])}.`,
      createdAt: minsAgo(between(1, 10000)),
    };
  });

  // Notes — 100
  const notes: Note[] = Array.from({ length: 100 }, (_, i) => {
    const user = pick(users);
    const entityType = pick(["lead", "deal", "customer", "contact"]);
    const target: { id: string }[] =
      entityType === "lead"
        ? leads
        : entityType === "deal"
          ? deals
          : entityType === "customer"
            ? customers
            : contacts;
    return {
      id: id("no", i),
      authorId: user.id,
      authorName: user.name,
      body: pick([
        "Great fit for enterprise tier.",
        "Asked for case studies.",
        "Decision expected next week.",
        "Needs procurement signoff.",
        "Champion identified.",
        "Concerns about timeline.",
      ]),
      entity: entityType,
      entityId: pick(target).id,
      createdAt: daysAgo(between(0, 30)),
      updatedAt: daysAgo(between(0, 5)),
    };
  });

  // Attachments — 50
  const attachments: Attachment[] = Array.from({ length: 50 }, (_, i) => {
    const entityType = pick(["lead", "deal", "customer", "contact"]);
    const target: { id: string }[] =
      entityType === "lead"
        ? leads
        : entityType === "deal"
          ? deals
          : entityType === "customer"
            ? customers
            : contacts;
    return {
      id: id("at", i),
      name: pick([
        "Proposal.pdf",
        "Contract.pdf",
        "Invoice.pdf",
        "Deck.pptx",
        "NDA.pdf",
        "Brief.docx",
        "Pricing.xlsx",
      ]),
      size: between(50_000, 5_000_000),
      type: "application/pdf",
      entity: entityType,
      entityId: pick(target).id,
      uploaderId: pick(ownerIds),
      createdAt: daysAgo(between(0, 60)),
    };
  });

  // Communications — 60
  const communications: Communication[] = Array.from({ length: 60 }, (_, i) => {
    const sender = pick(users);
    const recipient = pick(users);
    return {
      id: id("cm", i),
      channel: pick(["email", "call", "sms", "internal"] as const),
      fromId: sender.id,
      fromName: sender.name,
      toId: recipient.id,
      toName: recipient.name,
      subject: pick([
        "Re: Proposal",
        "Quick question",
        "Follow-up",
        "Pricing discussion",
        "Demo recap",
        "Contract draft",
      ]),
      body: "Auto-generated communication body. All systems nominal.",
      createdAt: minsAgo(between(1, 5000)),
    };
  });

  return {
    users,
    companies,
    leads,
    contacts,
    customers,
    deals,
    tasks,
    events,
    notifications,
    activities,
    notes,
    attachments,
    communications,
  };
}

export type SeedData = ReturnType<typeof buildSeed>;
