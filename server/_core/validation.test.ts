import { describe, it, expect } from "vitest";
import {
  validateEmail,
  validateUsername,
  validatePassword,
  validateAmount,
  validateCategory,
  validateDescription,
  validateTransactionType,
  validateDateRange,
  validateBackupFilename,
  validateSearchQuery,
  sanitizeString,
  validatePageNumber,
  validatePageSize,
  validateSortField,
  validateSortOrder,
} from "./validation";

describe("Validation Utilities", () => {
  describe("Email Validation", () => {
    it("should validate correct emails", () => {
      expect(validateEmail("user@example.com")).toBe(true);
      expect(validateEmail("test.email@domain.co.uk")).toBe(true);
    });

    it("should reject invalid emails", () => {
      expect(validateEmail("invalid.email")).toBe(false);
      expect(validateEmail("@example.com")).toBe(false);
      expect(validateEmail("user@")).toBe(false);
    });
  });

  describe("Username Validation", () => {
    it("should validate correct usernames", () => {
      expect(validateUsername("john_doe")).toBe(true);
      expect(validateUsername("user123")).toBe(true);
      expect(validateUsername("test-user")).toBe(true);
    });

    it("should reject invalid usernames", () => {
      expect(validateUsername("ab")).toBe(false); // Too short
      expect(validateUsername("user@name")).toBe(false); // Invalid char
      expect(validateUsername("a".repeat(21))).toBe(false); // Too long
    });
  });

  describe("Password Validation", () => {
    it("should validate strong passwords", () => {
      expect(validatePassword("SecurePass123")).toBe(true);
      expect(validatePassword("MyPassword456")).toBe(true);
    });

    it("should reject weak passwords", () => {
      expect(validatePassword("weak")).toBe(false); // Too short
      expect(validatePassword("nouppercasehere123")).toBe(false);
      expect(validatePassword("NOLOWERCASE123")).toBe(false);
      expect(validatePassword("NoNumbers")).toBe(false);
    });
  });

  describe("Amount Validation", () => {
    it("should validate correct amounts", () => {
      expect(validateAmount("100.00")).toBe(true);
      expect(validateAmount("0.01")).toBe(true);
      expect(validateAmount("999999.99")).toBe(true);
    });

    it("should reject invalid amounts", () => {
      expect(validateAmount("100")).toBe(false); // Missing decimals
      expect(validateAmount("-50.00")).toBe(false); // Negative
      expect(validateAmount("abc.de")).toBe(false); // Non-numeric
      expect(validateAmount("1000000000.00")).toBe(false); // Too large
    });
  });

  describe("Category Validation", () => {
    it("should validate correct categories", () => {
      expect(validateCategory("Alimentação")).toBe(true);
      expect(validateCategory("Transporte")).toBe(true);
    });

    it("should reject invalid categories", () => {
      expect(validateCategory("")).toBe(false); // Empty
      expect(validateCategory("a".repeat(51))).toBe(false); // Too long
      expect(validateCategory("Test<script>")).toBe(false); // XSS attempt
    });
  });

  describe("Description Validation", () => {
    it("should validate correct descriptions", () => {
      expect(validateDescription("Valid description")).toBe(true);
      expect(validateDescription("Another valid one")).toBe(true);
    });

    it("should reject invalid descriptions", () => {
      expect(validateDescription("a".repeat(501))).toBe(false); // Too long
      expect(validateDescription("Malicious<script>alert('xss')</script>")).toBe(false);
    });
  });

  describe("Transaction Type Validation", () => {
    it("should validate correct types", () => {
      expect(validateTransactionType("income")).toBe(true);
      expect(validateTransactionType("expense")).toBe(true);
    });

    it("should reject invalid types", () => {
      expect(validateTransactionType("transfer")).toBe(false);
      expect(validateTransactionType("INCOME")).toBe(false);
      expect(validateTransactionType("")).toBe(false);
    });
  });

  describe("Date Range Validation", () => {
    it("should validate correct date ranges", () => {
      const start = new Date("2026-04-01");
      const end = new Date("2026-04-30");
      expect(validateDateRange(start, end)).toBe(true);
    });

    it("should reject invalid date ranges", () => {
      const start = new Date("2026-04-30");
      const end = new Date("2026-04-01");
      expect(validateDateRange(start, end)).toBe(false); // Start after end

      const tooOld = new Date("2025-04-01");
      const now = new Date();
      expect(validateDateRange(tooOld, now)).toBe(false); // More than 1 year
    });

    it("should handle undefined dates", () => {
      expect(validateDateRange(undefined, undefined)).toBe(true);
      expect(validateDateRange(new Date(), undefined)).toBe(true);
    });
  });

  describe("Backup Filename Validation", () => {
    it("should validate correct filenames", () => {
      expect(validateBackupFilename("gestor_backup_2026-04-17T12-00-00-000Z.sql")).toBe(true);
    });

    it("should reject invalid filenames", () => {
      expect(validateBackupFilename("../../../etc/passwd")).toBe(false);
      expect(validateBackupFilename("backup.sql")).toBe(false); // Wrong prefix
      expect(validateBackupFilename("gestor_backup_2026-04-17.txt")).toBe(false); // Wrong extension
      expect(validateBackupFilename("gestor_backup_../../evil.sql")).toBe(false); // Path traversal
    });
  });

  describe("Search Query Validation", () => {
    it("should validate correct queries", () => {
      expect(validateSearchQuery("test")).toBe(true);
      expect(validateSearchQuery("search term")).toBe(true);
    });

    it("should reject invalid queries", () => {
      expect(validateSearchQuery("")).toBe(false); // Empty
      expect(validateSearchQuery("a".repeat(101))).toBe(false); // Too long
      expect(validateSearchQuery("test; DROP TABLE")).toBe(false); // SQL injection
      expect(validateSearchQuery("test -- comment")).toBe(false); // SQL comment
    });
  });

  describe("String Sanitization", () => {
    it("should remove dangerous characters", () => {
      expect(sanitizeString("<script>alert('xss')</script>")).not.toContain("<");
      expect(sanitizeString("javascript:void(0)")).not.toContain("javascript:");
      expect(sanitizeString("onclick=alert('xss')")).not.toContain("onclick=");
    });

    it("should preserve safe content", () => {
      expect(sanitizeString("  safe text  ")).toBe("safe text");
      expect(sanitizeString("normal text")).toBe("normal text");
    });
  });

  describe("Pagination Validation", () => {
    it("should validate correct page numbers", () => {
      expect(validatePageNumber(0, 10)).toBe(true);
      expect(validatePageNumber(5, 10)).toBe(true);
      expect(validatePageNumber(9, 10)).toBe(true);
    });

    it("should reject invalid page numbers", () => {
      expect(validatePageNumber(-1, 10)).toBe(false);
      expect(validatePageNumber(10, 10)).toBe(false);
      expect(validatePageNumber(3.5, 10)).toBe(false); // Not integer
    });
  });

  describe("Page Size Validation", () => {
    it("should validate correct page sizes", () => {
      expect(validatePageSize(10)).toBe(true);
      expect(validatePageSize(50)).toBe(true);
      expect(validatePageSize(100)).toBe(true);
    });

    it("should reject invalid page sizes", () => {
      expect(validatePageSize(0)).toBe(false);
      expect(validatePageSize(-10)).toBe(false);
      expect(validatePageSize(101)).toBe(false);
      expect(validatePageSize(10.5)).toBe(false);
    });
  });

  describe("Sort Field Validation", () => {
    it("should validate allowed fields", () => {
      const allowed = ["date", "amount", "category"];
      expect(validateSortField("date", allowed)).toBe(true);
      expect(validateSortField("amount", allowed)).toBe(true);
    });

    it("should reject disallowed fields", () => {
      const allowed = ["date", "amount"];
      expect(validateSortField("password", allowed)).toBe(false);
      expect(validateSortField("userId", allowed)).toBe(false);
    });
  });

  describe("Sort Order Validation", () => {
    it("should validate correct sort orders", () => {
      expect(validateSortOrder("asc")).toBe(true);
      expect(validateSortOrder("desc")).toBe(true);
      expect(validateSortOrder("ASC")).toBe(true);
      expect(validateSortOrder("DESC")).toBe(true);
    });

    it("should reject invalid sort orders", () => {
      expect(validateSortOrder("ascending")).toBe(false);
      expect(validateSortOrder("random")).toBe(false);
      expect(validateSortOrder("")).toBe(false);
    });
  });
});
