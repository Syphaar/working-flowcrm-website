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

describe("Deals", () => {
  it("should create a deal", () => {
    const deal = {
      id: "deal_1",
      name: "Enterprise License",
      customerName: "Big Corp",
      value: 100000,
      stage: "Negotiation",
      status: "Open",
      probability: 75,
      ownerId: "user_1",
      closeDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    insert("deals", deal);

    const found = findById<any>("deals", "deal_1");
    assert.ok(found);
    assert.strictEqual(found.value, 100000);
  });

  it("should filter won deals", () => {
    const wonDeal = {
      id: "deal_2",
      name: "Renewal",
      customerName: "Existing Client",
      value: 50000,
      stage: "Won",
      status: "Won",
      probability: 100,
      ownerId: "user_1",
      closeDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    insert("deals", wonDeal);

    const deals = getAll<any>("deals");
    const wonDeals = deals.filter((deal) => deal.status === "Won");
    assert.strictEqual(wonDeals.length, 1);
    assert.strictEqual(wonDeals[0].name, "Renewal");
  });

  it("should delete a deal", () => {
    removeById("deals", "deal_1");
    const deleted = findById<any>("deals", "deal_1");
    assert.strictEqual(deleted, undefined);
  });
});
