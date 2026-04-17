import { ForbiddenError } from "@shared/_core/errors";
import type { Request, Response } from "express";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";
import { COOKIE_NAME } from "@shared/const";

export type SessionPayload = {
  userId: number;
  username: string;
};

const JWT_SECRET = new TextEncoder().encode(ENV.jwtSecret || "default-secret-key");
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Create a JWT session token
 */
export async function createSessionToken(user: User): Promise<string> {
  const payload: SessionPayload = {
    userId: user.id!,
    username: user.username,
  };

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + SESSION_DURATION_MS / 1000)
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verify a JWT session token
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as SessionPayload;
  } catch (error) {
    console.error("[Auth] Failed to verify session token:", error);
    return null;
  }
}

/**
 * Get user from session cookie
 */
export async function getUserFromSession(req: Request): Promise<User | null> {
  const cookies = parseCookies(req.headers.cookie);
  const sessionCookie = cookies.get(COOKIE_NAME);

  if (!sessionCookie) {
    return null;
  }

  const session = await verifySessionToken(sessionCookie);
  if (!session) {
    return null;
  }

  const user = await db.getUserById(session.userId);
  if (!user || !user.isActive) {
    return null;
  }

  // Update last signed in
  await db.updateUserLastSignedIn(user.id!);

  return user;
}

/**
 * Parse cookies from header
 */
function parseCookies(cookieHeader?: string): Map<string, string> {
  const cookies = new Map<string, string>();
  if (!cookieHeader) return cookies;

  cookieHeader.split(";").forEach((cookie) => {
    const [name, value] = cookie.trim().split("=");
    if (name && value) {
      cookies.set(name, decodeURIComponent(value));
    }
  });

  return cookies;
}

/**
 * Authenticate user with username and password
 */
export async function authenticateUser(username: string, password: string): Promise<User | null> {
  const user = await db.getUserByUsername(username);
  if (!user || !user.isActive) {
    return null;
  }

  const passwordMatch = await db.comparePassword(password, user.passwordHash);
  if (!passwordMatch) {
    return null;
  }

  return user;
}
