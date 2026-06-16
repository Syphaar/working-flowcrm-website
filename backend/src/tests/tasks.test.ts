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

describe("Tasks", () => {
  it("should create a task", () => {
    const task = {
      id: "task_1",
      name: "Follow up with client",
      description: "Call the client about the proposal",
      priority: "High",
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      status: "Open",
      assigneeId: "user_1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    insert("tasks", task);

    const found = findById<any>("tasks", "task_1");
    assert.ok(found);
    assert.strictEqual(found.name, "Follow up with client");
  });

  it("should update task status", () => {
    const existing = findById<any>("tasks", "task_1");
    insert("tasks", { ...existing, status: "In Progress" });

    const updated = findById<any>("tasks", "task_1");
    assert.strictEqual(updated.status, "In Progress");
  });

  it("should filter tasks by assignee", () => {
    const tasks = getAll<any>("tasks");
    const userTasks = tasks.filter((task) => task.assigneeId === "user_1");
    assert.strictEqual(userTasks.length, 1);
  });

  it("should delete a task", () => {
    removeById("tasks", "task_1");
    const deleted = findById<any>("tasks", "task_1");
    assert.strictEqual(deleted, undefined);
  });
});
