import { describe, it, before } from "node:test";
import assert from "node:assert";
import {
  loadDatabase,
  resetDatabase,
  insert,
  getAll,
  findById,
  removeById,
} from "../config/database.js";

before(() => {
  loadDatabase();
  resetDatabase();
});

describe("Leads", () => {
  it("should create a lead", () => {
    const lead = {
      id: "lead_1",
      name: "Acme Corp Deal",
      company: "Acme Corp",
      email: "contact@acme.com",
      stage: "New Lead",
      status: "Active",
      ownerId: "user_1",
      value: 50000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    insert("leads", lead);

    const found = findById<any>("leads", "lead_1");
    assert.ok(found);
    assert.strictEqual(found.name, "Acme Corp Deal");
  });

  it("should get all leads", () => {
    const leads = getAll<any>("leads");
    assert.ok(Array.isArray(leads));
    assert.strictEqual(leads.length, 1);
  });

  it("should update a lead", () => {
    const existing = findById<any>("leads", "lead_1");
    insert("leads", { ...existing, stage: "Qualified" });

    const updated = findById<any>("leads", "lead_1");
    assert.strictEqual(updated.stage, "Qualified");
  });

  it("should delete a lead", () => {
    removeById("leads", "lead_1");
    const deleted = findById<any>("leads", "lead_1");
    assert.strictEqual(deleted, undefined);
  });
});
