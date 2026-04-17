import type { Express } from "express";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./cookies";
import { authenticateUser, createSessionToken } from "./auth";
import * as db from "../db";

export function registerAuthRoutes(app: Express) {
  /**
   * POST /api/auth/login
   * Login with username and password
   */
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      const user = await authenticateUser(username, password);
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      // Create session token
      const token = await createSessionToken(user);

      // Set session cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, cookieOptions);

      // Update last signed in
      await db.updateUserLastSignedIn(user.id!);

      return res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("[Auth] Login error:", error);
      return res.status(500).json({ error: "Login failed" });
    }
  });

  /**
   * POST /api/auth/register
   * Register a new user (only admin can create users)
   */
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password, name } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      // Check if user already exists
      const existingUser = await db.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ error: "Username already exists" });
      }

      // Create new user
      await db.createUser(username, password, name || null, "user");

      return res.json({ success: true, message: "User created successfully" });
    } catch (error) {
      console.error("[Auth] Register error:", error);
      return res.status(500).json({ error: "Registration failed" });
    }
  });

  /**
   * POST /api/auth/logout
   * Logout user
   */
  app.post("/api/auth/logout", (req, res) => {
    try {
      const cookieOptions = getSessionCookieOptions(req);
      res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return res.json({ success: true });
    } catch (error) {
      console.error("[Auth] Logout error:", error);
      return res.status(500).json({ error: "Logout failed" });
    }
  });

  /**
   * GET /api/auth/me
   * Get current user info
   */
  app.get("/api/auth/me", async (req, res) => {
    try {
      const { getUserFromSession } = await import("./auth");
      const user = await getUserFromSession(req);

      if (!user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      return res.json({
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      });
    } catch (error) {
      console.error("[Auth] Get user error:", error);
      return res.status(500).json({ error: "Failed to get user info" });
    }
  });
}
