import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as db from "./db";
import { authenticateUser, createSessionToken, verifySessionToken } from "./_core/auth";

describe("Independent Authentication System", () => {
  const testUsername = "testuser";
  const testPassword = "TestPassword123!";
  const testName = "Test User";

  beforeAll(async () => {
    // Clean up any existing test user
    const existingUser = await db.getUserByUsername(testUsername);
    if (existingUser) {
      console.log("Test user already exists, skipping creation");
    }
  });

  it("should create a user with hashed password", async () => {
    try {
      await db.createUser(testUsername, testPassword, testName, "user");
      const user = await db.getUserByUsername(testUsername);
      
      expect(user).toBeDefined();
      expect(user?.username).toBe(testUsername);
      expect(user?.name).toBe(testName);
      expect(user?.role).toBe("user");
      expect(user?.isActive).toBe(true);
      expect(user?.passwordHash).not.toBe(testPassword); // Password should be hashed
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  });

  it("should authenticate user with correct password", async () => {
    const user = await authenticateUser(testUsername, testPassword);
    
    expect(user).toBeDefined();
    expect(user?.username).toBe(testUsername);
    expect(user?.id).toBeDefined();
  });

  it("should reject authentication with incorrect password", async () => {
    const user = await authenticateUser(testUsername, "WrongPassword");
    expect(user).toBeNull();
  });

  it("should reject authentication with non-existent user", async () => {
    const user = await authenticateUser("nonexistent", testPassword);
    expect(user).toBeNull();
  });

  it("should create and verify session token", async () => {
    const user = await db.getUserByUsername(testUsername);
    expect(user).toBeDefined();

    if (user) {
      const token = await createSessionToken(user);
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");

      const payload = await verifySessionToken(token);
      expect(payload).toBeDefined();
      expect(payload?.userId).toBe(user.id);
      expect(payload?.username).toBe(testUsername);
    }
  });

  it("should reject invalid session token", async () => {
    const payload = await verifySessionToken("invalid.token.here");
    expect(payload).toBeNull();
  });

  it("should get user by ID", async () => {
    const userByUsername = await db.getUserByUsername(testUsername);
    expect(userByUsername).toBeDefined();

    if (userByUsername?.id) {
      const userById = await db.getUserById(userByUsername.id);
      expect(userById).toBeDefined();
      expect(userById?.username).toBe(testUsername);
    }
  });

  afterAll(async () => {
    console.log("Authentication tests completed");
  });
});
