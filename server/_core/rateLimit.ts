/**
 * Rate limiting middleware for API protection
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Check if request should be rate limited
 * @param key - Unique identifier (e.g., user ID, IP address)
 * @param limit - Maximum requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns true if request is allowed, false if rate limited
 */
export const checkRateLimit = (key: string, limit: number, windowMs: number): boolean => {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    // Create new entry
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count++;
  return true;
};

/**
 * Get remaining requests for a key
 */
export const getRemainingRequests = (key: string, limit: number): number => {
  const entry = rateLimitStore.get(key);
  if (!entry || Date.now() > entry.resetTime) {
    return limit;
  }
  return Math.max(0, limit - entry.count);
};

/**
 * Get reset time for a key
 */
export const getResetTime = (key: string): number | null => {
  const entry = rateLimitStore.get(key);
  if (!entry) return null;
  return entry.resetTime;
};

/**
 * Clear rate limit for a key
 */
export const clearRateLimit = (key: string): void => {
  rateLimitStore.delete(key);
};

/**
 * Clear all expired entries
 */
export const clearExpiredEntries = (): void => {
  const now = Date.now();
  const keysToDelete: string[] = [];
  
  rateLimitStore.forEach((entry, key) => {
    if (now > entry.resetTime) {
      keysToDelete.push(key);
    }
  });
  
  keysToDelete.forEach((key) => rateLimitStore.delete(key));
};

// Clean up expired entries every minute
setInterval(clearExpiredEntries, 60 * 1000);

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
  // Auth endpoints
  LOGIN: { limit: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  LOGOUT: { limit: 100, windowMs: 60 * 1000 }, // 100 per minute
  
  // Financial endpoints
  CREATE_TRANSACTION: { limit: 30, windowMs: 60 * 1000 }, // 30 per minute
  UPDATE_TRANSACTION: { limit: 30, windowMs: 60 * 1000 },
  DELETE_TRANSACTION: { limit: 20, windowMs: 60 * 1000 }, // 20 per minute
  GET_TRANSACTIONS: { limit: 100, windowMs: 60 * 1000 }, // 100 per minute
  EXPORT_TRANSACTIONS: { limit: 10, windowMs: 60 * 1000 }, // 10 per minute
  
  // Database endpoints
  CREATE_BACKUP: { limit: 5, windowMs: 60 * 60 * 1000 }, // 5 per hour
  RESTORE_BACKUP: { limit: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
  DELETE_BACKUP: { limit: 10, windowMs: 60 * 60 * 1000 }, // 10 per hour
  
  // WhatsApp endpoints
  PROCESS_MESSAGE: { limit: 100, windowMs: 60 * 1000 }, // 100 per minute
  
  // General API
  GENERAL: { limit: 1000, windowMs: 60 * 1000 }, // 1000 per minute
};
