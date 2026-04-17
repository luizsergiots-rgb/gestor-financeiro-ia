import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, transactions, systemConfig, whatsappMessages } from "../drizzle/schema";
import { ENV } from './_core/env';
import bcrypt from 'bcrypt';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Compare password with hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Create a new user with username and password
 */
export async function createUser(username: string, password: string, name?: string, role: 'user' | 'admin' = 'user'): Promise<InsertUser> {
  const db = await getDb();
  if (!db) {
    throw new Error("[Database] Cannot create user: database not available");
  }

  const passwordHash = await hashPassword(password);
  
  const result = await db.insert(users).values({
    username,
    passwordHash,
    name: name || null,
    role,
    isActive: true,
  });

  return {
    username,
    passwordHash,
    name: name || null,
    role,
    isActive: true,
  };
}

/**
 * Get user by username
 */
export async function getUserByUsername(username: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get user by ID
 */
export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Update user last signed in
 */
export async function updateUserLastSignedIn(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user: database not available");
    return;
  }

  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, userId));
}

/**
 * Get system configuration
 */
export async function getSystemConfig(key: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get config: database not available");
    return undefined;
  }

  const result = await db.select().from(systemConfig).where(eq(systemConfig.configKey, key)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Set system configuration
 */
export async function setSystemConfig(key: string, value: string, dataType: string = 'string'): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot set config: database not available");
    return;
  }

  const existing = await getSystemConfig(key);
  if (existing) {
    await db.update(systemConfig).set({ configValue: value, dataType }).where(eq(systemConfig.configKey, key));
  } else {
    await db.insert(systemConfig).values({ configKey: key, configValue: value, dataType });
  }
}

/**
 * Get all transactions for a user
 */
export async function getUserTransactions(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get transactions: database not available");
    return [];
  }

  return db.select().from(transactions).where(eq(transactions.userId, userId));
}

/**
 * Create a transaction
 */
export async function createTransaction(userId: number, type: 'income' | 'expense', amount: string, description?: string, category?: string, source?: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("[Database] Cannot create transaction: database not available");
  }

  return db.insert(transactions).values({
    userId,
    type,
    amount,
    description: description || null,
    category: category || null,
    source: source || null,
  });
}

/**
 * Log WhatsApp message
 */
export async function logWhatsappMessage(messageId: string, fromNumber: string, toNumber: string, messageType: 'text' | 'audio' | 'image' | 'document', messageContent?: string, transcription?: string, aiResponse?: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("[Database] Cannot log message: database not available");
  }

  return db.insert(whatsappMessages).values({
    messageId,
    fromNumber,
    toNumber,
    messageType,
    messageContent: messageContent || null,
    transcription: transcription || null,
    aiResponse: aiResponse || null,
    processedAt: new Date(),
  });
}
