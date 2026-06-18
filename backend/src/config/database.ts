import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { emitToAll } from "./socket.js";
import prisma from "./prisma.js";
import { seed } from "../seed.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "..", "..", "data");
const DB_FILE = path.join(DATA_DIR, "database.json");

const TABLE_TO_MODEL: Record<string, string> = {
  users: "user",
  companies: "company",
  leads: "lead",
  contacts: "contact",
  customers: "customer",
  deals: "deal",
  tasks: "task",
  events: "calendarEvent",
  notifications: "notification",
  activities: "activity",
  notes: "note",
  attachments: "fileAttachment",
  communications: "message",
  passwordResetTokens: "passwordResetToken",
  roles: "role",
  pipelines: "pipeline",
};

const TABLE_NAMES = Object.keys(TABLE_TO_MODEL);

const cache: Record<string, any[]> = {};
let loaded = false;
let prismaAvailable = true;
let useJsonFallback = false;

function saveJsonFallback(): void {
  if (useJsonFallback && fs.existsSync(DATA_DIR)) {
    try {
      const jsonData: Record<string, any[]> = {};
      for (const tableName of TABLE_NAMES) {
        jsonData[tableName] = cache[tableName] || [];
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(jsonData, null, 2));
    } catch { /* ignore */ }
  }
}

function loadFromJson(): void {
  try {
    if (fs.existsSync(DB_FILE)) {
      const jsonData = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
      for (const tableName of TABLE_NAMES) {
        cache[tableName] = jsonData[tableName] || [];
      }
      console.log(`Loaded ${TABLE_NAMES.length} tables from JSON file`);
    } else {
      for (const tableName of TABLE_NAMES) {
        cache[tableName] = [];
      }
    }
  } catch {
    for (const tableName of TABLE_NAMES) {
      cache[tableName] = [];
    }
  }
}

export async function loadDatabase(): Promise<void> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await prisma.$connect();
      break;
    } catch {
      if (attempt < 2) await new Promise(r => setTimeout(r, 1000));
      else { prismaAvailable = false; break; }
    }
  }

  if (prismaAvailable) {
    for (const tableName of TABLE_NAMES) {
      const model = TABLE_TO_MODEL[tableName];
      try {
        cache[tableName] = await (prisma as any)[model].findMany();
      } catch {
        prismaAvailable = false;
        break;
      }
    }
  }

  if (!prismaAvailable) {
    if (fs.existsSync(DB_FILE)) {
      loadFromJson();
      useJsonFallback = true;
      console.warn("PostgreSQL unavailable — using JSON file as fallback");
    } else {
      console.log("PostgreSQL unavailable, no JSON fallback — seeding fresh data");
      await seed();
      useJsonFallback = true;
      if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
      saveJsonFallback();
    }
  } else {
    const hasUsers = cache["users"] && cache["users"].length > 0;
    if (!hasUsers) {
      console.warn("PostgreSQL is empty — seeding with comprehensive demo data (50 companies, 100 leads, etc)...");
      await seed();
      console.log("Database seeded and written to PostgreSQL.");
    } else {
      console.log(`Loaded ${TABLE_NAMES.length} tables from PostgreSQL`);
    }
  }

  loaded = true;
}

function ensureLoaded(): void {
  if (!loaded) throw new Error("Database not loaded. Call loadDatabase() first.");
}

export function getDatabase(): Record<string, any[]> {
  ensureLoaded();
  return cache;
}

export function resetDatabase(): void {
  for (const key of TABLE_NAMES) {
    cache[key] = [];
  }
}

export function getTable<T>(name: string): T[] {
  ensureLoaded();
  return cache[name] as unknown as T[];
}

export function getAll<T>(name: string): T[] {
  return [...getTable<T>(name)];
}

export function findById<T extends { id: string }>(name: string, id: string): T | undefined {
  return getTable<T>(name).find((item) => item.id === id);
}

export function insert<T extends { id: string }>(name: string, item: T): T {
  const table = getTable<T>(name);
  const existingIndex = table.findIndex((entry) => entry.id === item.id);
  if (existingIndex >= 0) {
    table[existingIndex] = item;
  } else {
    table.unshift(item);
  }

  if (prismaAvailable) {
    const model = TABLE_TO_MODEL[name];
    if (model) {
      (prisma as any)[model]
        .upsert({
          where: { id: item.id },
          create: item,
          update: item,
        })
        .catch((err: Error) => console.error(`Prisma write error [${name}]:`, err.message));
    }
  } else {
    saveJsonFallback();
  }

  emitToAll("entity:updated", { entity: name, item });
  return item;
}

export function removeById(name: string, id: string): void {
  const table = cache[name] as any[];
  if (!table) return;
  const index = table.findIndex((entry: any) => entry.id === id);
  if (index >= 0) {
    table.splice(index, 1);
  }

  if (prismaAvailable) {
    const model = TABLE_TO_MODEL[name];
    if (model) {
      (prisma as any)[model]
        .delete({ where: { id } })
        .catch((err: Error) => console.error(`Prisma delete error [${name}]:`, err.message));
    }
  } else {
    saveJsonFallback();
  }

  emitToAll("entity:deleted", { entity: name, id });
}

export function bulkRemoveByIds(name: string, ids: string[]): void {
  const table = cache[name] as any[];
  if (!table) return;
  for (const id of ids) {
    const index = table.findIndex((entry: any) => entry.id === id);
    if (index >= 0) {
      table.splice(index, 1);
    }
  }

  if (prismaAvailable) {
    const model = TABLE_TO_MODEL[name];
    if (model) {
      (prisma as any)[model]
        .deleteMany({ where: { id: { in: ids } } })
        .catch((err: Error) => console.error(`Prisma bulk delete error [${name}]:`, err.message));
    }
  } else {
    saveJsonFallback();
  }

  emitToAll("entity:deleted", { entity: name, ids });
}

export function query<T>(name: string, predicate: (item: T) => boolean): T[] {
  return getTable<T>(name).filter(predicate);
}
