import { fileURLToPath } from "url";
import path from "path";
import bcrypt from "bcryptjs";
import { resetDatabase, insert } from "./config/database.js";

function mulberry32(seed: number) {
  let state = seed;
  return () => {
    let value = (state += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

const randomGenerator = mulberry32(20260612);
const pickRandom = <T>(array: T[]) =>
  array[Math.floor(randomGenerator() * array.length)];
const randomBetween = (min: number, max: number) =>
  Math.floor(randomGenerator() * (max - min + 1)) + min;
const generateId = (prefix: string, index: number) =>
  `${prefix}_${(index + 1).toString().padStart(4, "0")}`;
const daysAgo = (days: number) =>
  new Date(Date.now() - days * 86400000).toISOString();
const minutesAgo = (minutes: number) =>
  new Date(Date.now() - minutes * 60000).toISOString();
const daysFromNow = (days: number) =>
  new Date(Date.now() + days * 86400000).toISOString();

const FIRST_NAMES = [
  "Aarav", "Liam", "Olivia", "Noah", "Emma", "Sophia", "Mateo", "Aria",
  "Yuki", "Chen", "Priya", "Ravi", "Aisha", "Diego", "Maya", "Leo",
  "Zara", "Amir", "Nora", "Eli", "Hannah", "Jin", "Luca", "Mei",
  "Omar", "Sara", "Tariq", "Wei", "Yara", "Ivan", "Anya", "Kofi",
  "Rosa", "Ahmed", "Lina", "Dmitri", "Hugo", "Sana", "Tomas", "Aiko",
];
const LAST_NAMES = [
  "Sharma", "Patel", "Chen", "Garcia", "Rodriguez", "Kim", "Lee",
  "Brown", "Smith", "Wang", "Khan", "Singh", "Liu", "Tanaka",
  "Nguyen", "Silva", "Diaz", "Ali", "Cohen", "Park", "Hassan",
  "Okafor", "Mendes", "Petrov", "Yamamoto", "Davis", "Wright",
  "Jones", "Carter", "Mehta", "Iyer", "Rao", "Reddy", "Bose",
  "Das", "Ng", "Tran", "Bauer", "Schmidt", "Rossi",
];
const COMPANY_NAMES = [
  "Acme Corp", "Globex", "Initech", "Umbrella", "Stark Industries",
  "Wayne Enterprises", "Wonka", "Cyberdyne", "Aperture", "Hooli",
  "Pied Piper", "Massive Dynamic", "Soylent", "Tyrell", "Oscorp",
  "Lexcorp", "Vandelay", "Sterling Cooper", "Dunder Mifflin",
  "Gringotts", "Black Mesa", "Vault-Tec", "Weyland", "Nakatomi",
  "Bluebook", "Encom", "Krusty Krab", "MomCorp", "Yoyodyne",
  "Vector", "Northrop", "Helios", "Tessier-Ashpool", "Cyrez",
  "Massive Beam", "Quantum Forge", "Lumen", "Nimbus", "Helix",
  "Strata", "Cogent", "Apex", "Vertex", "Nova", "Echelon",
  "Catalyst", "Sapient", "Vanta", "Nimble", "Solstice",
];
const INDUSTRIES = [
  "Software", "Finance", "Healthcare", "Retail", "Manufacturing",
  "Education", "Energy", "Logistics", "Real Estate", "Media",
];
const SOURCES = [
  "Website", "Referral", "LinkedIn", "Cold Email", "Event",
  "Partner", "Ad Campaign", "Webinar",
];
const TAGS = [
  "enterprise", "smb", "priority", "hot", "cold", "follow-up",
  "vip", "trial", "onboarding", "expansion",
];
const STAGES = [
  "New_Lead", "Contacted", "Qualified", "Proposal_Sent",
  "Negotiation", "Won", "Lost",
];
const DEPARTMENTS = [
  "Sales", "Marketing", "Support", "Operations", "Finance", "Engineering",
];

const fullName = () =>
  `${pickRandom(FIRST_NAMES)} ${pickRandom(LAST_NAMES)}`;
const generateEmail = (name: string, company: string) =>
  `${name.toLowerCase().replace(/[^a-z]/g, ".")}@${company
    .toLowerCase()
    .replace(/[^a-z]/g, "")}.com`;
const generatePhone = () =>
  `+1 (${randomBetween(200, 999)}) ${randomBetween(100, 999)}-${randomBetween(
    1000,
    9999
  )}`;

export async function seed() {
  resetDatabase();

  const superAdminPassword = await bcrypt.hash("SuperAdmin123", 10);
  const teamMemberPassword = await bcrypt.hash("TeamMember123", 10);
  const defaultPassword = await bcrypt.hash("Demo123", 10);

  const users: any[] = [
    {
      id: "user_super_admin",
      name: "Alex Morgan",
      email: "superadmin@flowcrm.com",
      password: superAdminPassword,
      phone: generatePhone(),
      department: "Executive",
      role: "super_admin",
      roles: ["super_admin"],
      status: "online",
      lastActive: minutesAgo(2),
      lastLogin: minutesAgo(5),
      lastLogout: daysAgo(1),
      createdAt: daysAgo(400),
      twoFactor: false,
    },
    {
      id: "user_sales_executive",
      name: "Jordan Rivera",
      email: "sales@flowcrm.com",
      password: teamMemberPassword,
      phone: generatePhone(),
      department: "Sales",
      role: "sales_executive",
      roles: ["sales_executive"],
      status: "online",
      lastActive: minutesAgo(8),
      lastLogin: minutesAgo(20),
      lastLogout: daysAgo(1),
      createdAt: daysAgo(300),
      twoFactor: false,
    },
  ];

  for (let index = 0; index < 13; index++) {
    const name = fullName();
    const role =
      index < 2
        ? "manager"
        : index < 6
          ? "sales_executive"
          : index < 9
            ? "marketing"
            : "sales_executive";
    users.push({
      id: generateId("user", index + 2),
      name,
      email: generateEmail(name, "flowcrm"),
      password: defaultPassword,
      phone: generatePhone(),
      department: pickRandom(DEPARTMENTS),
      role,
      roles: [role],
      status: pickRandom(["online", "away", "offline", "online"]),
      lastActive: minutesAgo(randomBetween(1, 600)),
      lastLogin: daysAgo(randomBetween(0, 5)),
      lastLogout: daysAgo(randomBetween(0, 7)),
      createdAt: daysAgo(randomBetween(50, 500)),
      twoFactor: false,
    });
  }

  const ownerIds = users.map((user) => user.id);
  for (const user of users) insert("users", user);

  const companies: any[] = Array.from({ length: 50 }, (_, index) => {
    const name = `${COMPANY_NAMES[index % COMPANY_NAMES.length]}${index >= COMPANY_NAMES.length ? " " + (index - COMPANY_NAMES.length + 2) : ""}`;
    return {
      id: generateId("company", index),
      name,
      industry: pickRandom(INDUSTRIES),
      website: `https://${name.toLowerCase().replace(/[^a-z]/g, "")}.com`,
      address: `${randomBetween(100, 9999)} ${pickRandom(["Market", "Main", "Pine", "Oak", "King", "Cedar"])} St, ${pickRandom(["NY", "SF", "LA", "Chicago", "Austin", "Seattle", "Boston", "Denver"])}`,
      revenue: randomBetween(100000, 50000000),
      employees: randomBetween(10, 5000),
      status: pickRandom(["Active", "Prospect", "Active", "Active", "Inactive"]),
      ownerId: pickRandom(ownerIds),
      createdAt: daysAgo(randomBetween(30, 600)),
      updatedAt: daysAgo(randomBetween(0, 30)),
    };
  });
  for (const company of companies) insert("companies", company);

  const leads: any[] = Array.from({ length: 100 }, (_, index) => {
    const name = fullName();
    const company = pickRandom(companies).name;
    return {
      id: generateId("lead", index),
      name,
      company,
      email: generateEmail(name, company),
      phone: generatePhone(),
      source: pickRandom(SOURCES),
      stage: pickRandom(STAGES),
      status: pickRandom(["Active", "Active", "Inactive", "Converted", "Lost"]),
      ownerId: pickRandom(ownerIds),
      value: randomBetween(2000, 250000),
      notes: pickRandom([
        "Interested in enterprise plan",
        "Requested demo",
        "Comparing competitors",
        "Budget approved Q1",
        "Decision maker engaged",
        "Awaiting proposal",
      ]),
      tags: [pickRandom(TAGS), pickRandom(TAGS)],
      createdAt: daysAgo(randomBetween(0, 180)),
      updatedAt: daysAgo(randomBetween(0, 20)),
    };
  });
  for (const lead of leads) insert("leads", lead);

  const contacts: any[] = Array.from({ length: 100 }, (_, index) => {
    const name = fullName();
    const company = pickRandom(companies);
    return {
      id: generateId("contact", index),
      name,
      email: generateEmail(name, company.name),
      phone: generatePhone(),
      companyId: company.id,
      company: company.name,
      title: pickRandom([
        "CEO", "CTO", "VP Sales", "Director", "Manager",
        "Engineer", "Analyst", "Product Lead",
      ]),
      ownerId: pickRandom(ownerIds),
      tags: [pickRandom(TAGS)],
      createdAt: daysAgo(randomBetween(0, 300)),
      updatedAt: daysAgo(randomBetween(0, 30)),
    };
  });
  for (const contact of contacts) insert("contacts", contact);

  const customers: any[] = Array.from({ length: 50 }, (_, index) => {
    const name = fullName();
    const company = pickRandom(companies);
    return {
      id: generateId("customer", index),
      name,
      company: company.name,
      email: generateEmail(name, company.name),
      phone: generatePhone(),
      status: pickRandom(["Active", "Active", "VIP", "At_Risk", "Churned"]),
      totalSpend: randomBetween(5000, 500000),
      ownerId: pickRandom(ownerIds),
      createdAt: daysAgo(randomBetween(30, 700)),
      updatedAt: daysAgo(randomBetween(0, 14)),
    };
  });
  for (const customer of customers) insert("customers", customer);

  const deals: any[] = Array.from({ length: 40 }, (_, index) => {
    const customer = pickRandom(customers);
    const stage = pickRandom(STAGES);
    return {
      id: generateId("deal", index),
      name: `${customer.company} — ${pickRandom(["Annual License", "Expansion", "Enterprise Plan", "Pilot", "Renewal", "Add-on"])}`,
      customerId: customer.id,
      customerName: customer.name,
      value: randomBetween(5000, 350000),
      stage,
      status:
        stage === "Won" ? "Won" : stage === "Lost" ? "Lost" : "Open",
      probability:
        stage === "Won"
          ? 100
          : stage === "Lost"
            ? 0
            : randomBetween(10, 90),
      ownerId: pickRandom(ownerIds),
      closeDate: daysFromNow(randomBetween(-30, 90)),
      createdAt: daysAgo(randomBetween(0, 120)),
      updatedAt: daysAgo(randomBetween(0, 14)),
    };
  });
  for (const deal of deals) insert("deals", deal);

  for (let index = 0; index < 30; index++) {
    insert("tasks", {
      id: generateId("task", index),
      name: pickRandom([
        "Follow up call", "Send proposal", "Schedule demo",
        "Send contract", "Quarterly review", "Onboarding session",
        "Renewal discussion", "Discovery call",
      ]),
      description: "Auto-generated demo task.",
      priority: pickRandom(["Low", "Medium", "High", "Urgent"]),
      dueDate: daysFromNow(randomBetween(-3, 21)),
      status: pickRandom(["Open", "Open", "In_Progress", "Done"]),
      assigneeId: pickRandom(ownerIds),
      createdAt: daysAgo(randomBetween(0, 30)),
      updatedAt: daysAgo(randomBetween(0, 5)),
    });
  }

  for (let index = 0; index < 50; index++) {
    const startDate = daysFromNow(randomBetween(-7, 30));
    const startDateTime = new Date(startDate);
    insert("events", {
      id: generateId("event", index),
      title: pickRandom([
        "Discovery Call", "Product Demo", "Quarterly Review",
        "Onboarding", "Strategy Sync", "Pricing Discussion",
        "Stakeholder Meeting",
      ]),
      description: "Auto-generated event.",
      startsAt: startDate,
      endsAt: new Date(
        startDateTime.getTime() + randomBetween(30, 120) * 60000
      ).toISOString(),
      attendees: [pickRandom(ownerIds), pickRandom(ownerIds)],
      recurrence: pickRandom(["none", "none", "none", "weekly", "monthly"]),
      status: pickRandom(["Scheduled", "Scheduled", "Completed"]),
      createdAt: daysAgo(randomBetween(1, 30)),
      updatedAt: daysAgo(randomBetween(0, 5)),
    });
  }

  for (let index = 0; index < 25; index++) {
    const sender = pickRandom(users);
    insert("notifications", {
      id: generateId("notification", index),
      title: pickRandom([
        "New deal assigned", "Customer renewed", "Task overdue",
        "Lead converted", "Quota update", "Welcome aboard",
        "Pipeline review", "Monthly report",
      ]),
      message:
        "This is a system-generated notification with relevant context for the recipient.",
      senderId: sender.id,
      senderName: sender.name,
      recipientId: pickRandom(ownerIds),
      read: randomGenerator() > 0.5,
      type: pickRandom(["info", "success", "warning", "danger"]),
      createdAt: minutesAgo(randomBetween(5, 5000)),
    });
  }

  const activityKinds = [
    "create", "update", "login", "logout", "stage_change",
    "assign", "notification", "status_change",
  ];
  for (let index = 0; index < 100; index++) {
    const user = pickRandom(users);
    insert("activities", {
      id: generateId("activity", index),
      userId: user.id,
      userName: user.name,
      role: user.role,
      kind: pickRandom(activityKinds),
      entity: pickRandom(["Lead", "Deal", "Customer", "Contact", "Task"]),
      description: `${user.name} performed ${pickRandom(activityKinds)} on ${pickRandom(["a lead", "a deal", "a customer", "a contact", "a task"])}.`,
      createdAt: minutesAgo(randomBetween(1, 10000)),
    });
  }

  for (let index = 0; index < 100; index++) {
    const user = pickRandom(users);
    const entityType = pickRandom(["lead", "deal", "customer", "contact"]);
    const entityMap: Record<string, any[]> = {
      lead: leads,
      deal: deals,
      customer: customers,
      contact: contacts,
    };
    const targetEntities = entityMap[entityType];
    insert("notes", {
      id: generateId("note", index),
      authorId: user.id,
      authorName: user.name,
      body: pickRandom([
        "Great fit for enterprise tier.",
        "Asked for case studies.",
        "Decision expected next week.",
        "Needs procurement signoff.",
        "Champion identified.",
        "Concerns about timeline.",
      ]),
      entity: entityType,
      entityId: pickRandom(targetEntities).id,
      createdAt: daysAgo(randomBetween(0, 30)),
      updatedAt: daysAgo(randomBetween(0, 5)),
    });
  }

  for (let index = 0; index < 50; index++) {
    const entityType = pickRandom(["lead", "deal", "customer", "contact"]);
    const entityMap: Record<string, any[]> = {
      lead: leads,
      deal: deals,
      customer: customers,
      contact: contacts,
    };
    const targetEntities = entityMap[entityType];
    insert("attachments", {
      id: generateId("attachment", index),
      name: pickRandom([
        "Proposal.pdf", "Contract.pdf", "Invoice.pdf", "Deck.pptx",
        "NDA.pdf", "Brief.docx", "Pricing.xlsx",
      ]),
      size: randomBetween(50000, 5000000),
      type: "application/pdf",
      entity: entityType,
      entityId: pickRandom(targetEntities).id,
      uploaderId: pickRandom(ownerIds),
      createdAt: daysAgo(randomBetween(0, 60)),
    });
  }

  for (let index = 0; index < 60; index++) {
    const from = pickRandom(users);
    const to = pickRandom(users);
    insert("communications", {
      id: generateId("communication", index),
      channel: pickRandom(["email", "call", "sms", "internal"]),
      fromId: from.id,
      fromName: from.name,
      toId: to.id,
      toName: to.name,
      subject: pickRandom([
        "Re: Proposal", "Quick question", "Follow-up",
        "Pricing discussion", "Demo recap", "Contract draft",
      ]),
      body: "Auto-generated communication body. All systems nominal.",
      createdAt: minutesAgo(randomBetween(1, 5000)),
    });
  }

  console.log("Database seeded successfully with demo data.");
}

const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  seed().catch(console.error);
}
