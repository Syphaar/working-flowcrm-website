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

describe("Users", () => {
  it("should create a user", () => {
    const user = {
      id: "user_1",
      name: "John Doe",
      email: "john@example.com",
      role: "sales_executive",
      createdAt: new Date().toISOString(),
    };
    insert("users", user);

    const found = findById<any>("users", "user_1");
    assert.ok(found);
    assert.strictEqual(found.name, "John Doe");
  });

  it("should get all users", () => {
    const users = getAll<any>("users");
    assert.ok(Array.isArray(users));
    assert.strictEqual(users.length, 1);
  });

  it("should update a user", () => {
    const existing = findById<any>("users", "user_1");
    insert("users", { ...existing, name: "Jane Doe" });

    const updated = findById<any>("users", "user_1");
    assert.strictEqual(updated.name, "Jane Doe");
  });

  it("should delete a user", () => {
    removeById("users", "user_1");
    const deleted = findById<any>("users", "user_1");
    assert.strictEqual(deleted, undefined);
  });
});
