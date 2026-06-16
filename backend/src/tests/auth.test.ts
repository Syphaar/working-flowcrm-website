import { describe, it, before } from "node:test";
import assert from "node:assert";
import { loadDatabase, resetDatabase, insert, getAll } from "../config/database.js";
import { hashPassword, comparePassword } from "../auth/password.js";
import { signToken, verifyToken } from "../auth/jwt.js";

before(() => {
  loadDatabase();
  resetDatabase();
});

describe("Authentication", () => {
  it("should hash and compare passwords correctly", async () => {
    const password = "TestPassword123";
    const hashed = await hashPassword(password);
    assert.notStrictEqual(hashed, password);

    const isMatch = await comparePassword(password, hashed);
    assert.strictEqual(isMatch, true);

    const isNotMatch = await comparePassword("WrongPassword", hashed);
    assert.strictEqual(isNotMatch, false);
  });

  it("should sign and verify JWT tokens", () => {
    const payload = { userId: "test_user", name: "Test", role: "super_admin" };
    const token = signToken(payload);
    assert.ok(typeof token === "string");

    const decoded = verifyToken(token);
    assert.strictEqual(decoded.userId, payload.userId);
    assert.strictEqual(decoded.name, payload.name);
    assert.strictEqual(decoded.role, payload.role);
  });

  it("should reject invalid tokens", () => {
    assert.throws(() => verifyToken("invalid-token"));
  });

  it("should register a new user", async () => {
    const hashedPassword = await hashPassword("TestPass123");
    const user = {
      id: "test_user_1",
      name: "Test User",
      email: "test@example.com",
      password: hashedPassword,
      role: "sales_executive",
      createdAt: new Date().toISOString(),
    };

    insert("users", user);
    const users = getAll<any>("users");
    assert.strictEqual(users.length, 1);
    assert.strictEqual(users[0].email, "test@example.com");
  });
});
