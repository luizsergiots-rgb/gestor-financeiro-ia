import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  checkRateLimit,
  getRemainingRequests,
  getResetTime,
  clearRateLimit,
  clearExpiredEntries,
  RATE_LIMITS,
} from "./rateLimit";

describe("Rate Limiting", () => {
  beforeEach(() => {
    // Clear all rate limits before each test
    clearRateLimit("test-user");
    clearRateLimit("test-user-2");
  });

  afterEach(() => {
    clearRateLimit("test-user");
    clearRateLimit("test-user-2");
  });

  it("should allow requests within limit", () => {
    const key = "test-user";
    const limit = 5;
    const windowMs = 60000;

    for (let i = 0; i < limit; i++) {
      expect(checkRateLimit(key, limit, windowMs)).toBe(true);
    }
  });

  it("should block requests exceeding limit", () => {
    const key = "test-user";
    const limit = 3;
    const windowMs = 60000;

    // Use up the limit
    for (let i = 0; i < limit; i++) {
      checkRateLimit(key, limit, windowMs);
    }

    // Next request should be blocked
    expect(checkRateLimit(key, limit, windowMs)).toBe(false);
  });

  it("should reset after time window expires", (done) => {
    const key = "test-user";
    const limit = 2;
    const windowMs = 100; // 100ms for testing

    // Use up the limit
    checkRateLimit(key, limit, windowMs);
    checkRateLimit(key, limit, windowMs);

    // Should be blocked
    expect(checkRateLimit(key, limit, windowMs)).toBe(false);

    // Wait for window to expire
    setTimeout(() => {
      // Should be allowed again
      expect(checkRateLimit(key, limit, windowMs)).toBe(true);
      done();
    }, 150);
  });

  it("should track remaining requests correctly", () => {
    const key = "test-user";
    const limit = 5;
    const windowMs = 60000;

    expect(getRemainingRequests(key, limit)).toBe(limit);

    checkRateLimit(key, limit, windowMs);
    expect(getRemainingRequests(key, limit)).toBe(limit - 1);

    checkRateLimit(key, limit, windowMs);
    expect(getRemainingRequests(key, limit)).toBe(limit - 2);
  });

  it("should return correct reset time", () => {
    const key = "test-user";
    const limit = 5;
    const windowMs = 60000;

    checkRateLimit(key, limit, windowMs);
    const resetTime = getResetTime(key);

    expect(resetTime).not.toBeNull();
    expect(resetTime).toBeGreaterThan(Date.now());
    expect(resetTime).toBeLessThanOrEqual(Date.now() + windowMs);
  });

  it("should handle multiple users independently", () => {
    const limit = 2;
    const windowMs = 60000;

    // User 1
    checkRateLimit("user-1", limit, windowMs);
    checkRateLimit("user-1", limit, windowMs);
    expect(checkRateLimit("user-1", limit, windowMs)).toBe(false);

    // User 2 should not be affected
    expect(checkRateLimit("user-2", limit, windowMs)).toBe(true);
    expect(checkRateLimit("user-2", limit, windowMs)).toBe(true);
    expect(checkRateLimit("user-2", limit, windowMs)).toBe(false);
  });

  it("should clear rate limit for a key", () => {
    const key = "test-user";
    const limit = 2;
    const windowMs = 60000;

    checkRateLimit(key, limit, windowMs);
    checkRateLimit(key, limit, windowMs);
    expect(checkRateLimit(key, limit, windowMs)).toBe(false);

    // Clear the rate limit
    clearRateLimit(key);

    // Should be allowed again
    expect(checkRateLimit(key, limit, windowMs)).toBe(true);
  });

  it("should have correct rate limit configurations", () => {
    expect(RATE_LIMITS.LOGIN.limit).toBe(5);
    expect(RATE_LIMITS.LOGIN.windowMs).toBe(15 * 60 * 1000);

    expect(RATE_LIMITS.CREATE_TRANSACTION.limit).toBe(30);
    expect(RATE_LIMITS.CREATE_TRANSACTION.windowMs).toBe(60 * 1000);

    expect(RATE_LIMITS.CREATE_BACKUP.limit).toBe(5);
    expect(RATE_LIMITS.CREATE_BACKUP.windowMs).toBe(60 * 60 * 1000);
  });

  it("should prevent brute force login attempts", () => {
    const key = "attacker-ip";
    const { limit, windowMs } = RATE_LIMITS.LOGIN;

    // Try to login 5 times (should succeed)
    for (let i = 0; i < limit; i++) {
      expect(checkRateLimit(key, limit, windowMs)).toBe(true);
    }

    // 6th attempt should fail
    expect(checkRateLimit(key, limit, windowMs)).toBe(false);
  });

  it("should allow high frequency general API calls", () => {
    const key = "api-user";
    const { limit, windowMs } = RATE_LIMITS.GENERAL;

    // Should allow calls up to the limit
    for (let i = 0; i < limit; i++) {
      expect(checkRateLimit(key, limit, windowMs)).toBe(true);
    }

    // But not unlimited - next call should fail
    expect(checkRateLimit(key, limit, windowMs)).toBe(false);
  });

  it("should prevent backup spam", () => {
    const key = "backup-user";
    const { limit, windowMs } = RATE_LIMITS.CREATE_BACKUP;

    // Should allow 5 backups per hour
    for (let i = 0; i < limit; i++) {
      expect(checkRateLimit(key, limit, windowMs)).toBe(true);
    }

    // 6th should fail
    expect(checkRateLimit(key, limit, windowMs)).toBe(false);
  });
});
