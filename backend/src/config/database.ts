import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { emitToAll } from "./socket.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "..", "..", "data");
const DB_FILE = path.join(DATA_DIR, "database.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface DatabaseSchema {
  users: any[];
  companies: any[];
  leads: any[];
  contacts: any[];
  customers: any[];
  deals: any[];
  tasks: any[];
  events: any[];
  notifications: any[];
  activities: any[];
  notes: any[];
  attachments: any[];
  communications: any[];
  passwordResetTokens: any[];
  roles: any[];
  pipelines: any[];
}

function createEmptyDatabase(): DatabaseSchema {
  return {
    users: [],
    companies: [],
    leads: [],
    contacts: [],
    customers: [],
    deals: [],
    tasks: [],
    events: [],
    notifications: [],
    activities: [],
    notes: [],
    attachments: [],
    communications: [],
    passwordResetTokens: [],
    roles: [],
    pipelines: [],
  };
}

let data: DatabaseSchema = createEmptyDatabase();

export function loadDatabase(): void {
  try {
    if (fs.existsSync(DB_FILE)) {
      data = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
    }
  } catch {
    data = createEmptyDatabase();
  }
}

export function saveDatabase(): void {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

export function getDatabase(): DatabaseSchema {
  return data;
}

export function resetDatabase(): void {
  data = createEmptyDatabase();
  saveDatabase();
}

export function getTable<T>(name: keyof DatabaseSchema): T[] {
  return data[name] as unknown as T[];
}

export function getAll<T>(name: keyof DatabaseSchema): T[] {
  return [...getTable<T>(name)];
}

export function findById<T extends { id: string }>(
  name: keyof DatabaseSchema,
  id: string
): T | undefined {
  return getTable<T>(name).find((item) => item.id === id);
}

export function insert<T extends { id: string }>(
  name: keyof DatabaseSchema,
  item: T
): T {
  const table = getTable<T>(name);
  const existingIndex = table.findIndex((entry) => entry.id === item.id);
  if (existingIndex >= 0) {
    table[existingIndex] = item;
  } else {
    table.unshift(item);
  }
  saveDatabase();
  emitToAll("entity:updated", { entity: name, item });
  return item;
}

export function removeById(name: keyof DatabaseSchema, id: string): void {
  const table = data[name] as any[];
  const index = table.findIndex((entry: any) => entry.id === id);
  if (index >= 0) {
    table.splice(index, 1);
  }
  saveDatabase();
  emitToAll("entity:deleted", { entity: name, id });
}

export function bulkRemoveByIds(
  name: keyof DatabaseSchema,
  ids: string[]
): void {
  const table = data[name] as any[];
  for (const id of ids) {
    const index = table.findIndex((entry: any) => entry.id === id);
    if (index >= 0) {
      table.splice(index, 1);
    }
  }
  saveDatabase();
  emitToAll("entity:deleted", { entity: name, ids });
}

export function query<T>(
  name: keyof DatabaseSchema,
  predicate: (item: T) => boolean
): T[] {
  return getTable<T>(name).filter(predicate);
}

loadDatabase();
