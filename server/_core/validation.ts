/**
 * Input validation utilities for security
 */

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
};

export const validateUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
};

export const validatePassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

export const validateAmount = (amount: string): boolean => {
  const amountRegex = /^\d+\.\d{2}$/;
  if (!amountRegex.test(amount)) return false;
  
  const num = parseFloat(amount);
  return num > 0 && num <= 999999999.99;
};

export const validateCategory = (category: string): boolean => {
  return category.length > 0 && category.length <= 50 && !category.includes("<") && !category.includes(">");
};

export const validateDescription = (description: string): boolean => {
  return description.length <= 500 && !description.includes("<script");
};

export const validateTransactionType = (type: string): boolean => {
  return ["income", "expense"].includes(type);
};

export const validateDateRange = (startDate: Date | undefined, endDate: Date | undefined): boolean => {
  if (!startDate || !endDate) return true;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Check if dates are valid
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;
  
  // Check if start is before end
  if (start > end) return false;
  
  // Check if range is not more than 1 year
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays <= 365;
};

export const validateBackupFilename = (filename: string): boolean => {
  // Must start with gestor_backup_ and end with .sql
  // Must not contain path traversal patterns
  const isValid = filename.startsWith("gestor_backup_") && 
                  filename.endsWith(".sql") &&
                  !filename.includes("..") &&
                  !filename.includes("/") &&
                  !filename.includes("\\") &&
                  filename.length <= 100;
  
  return isValid;
};

export const validateSearchQuery = (query: string): boolean => {
  // Must not be empty, max 100 chars, no SQL injection patterns
  return query.length > 0 && 
         query.length <= 100 && 
         !query.includes(";") &&
         !query.includes("--") &&
         !query.includes("/*");
};

export const sanitizeString = (str: string): string => {
  // Remove potentially dangerous characters
  return str
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .trim();
};

export const validatePageNumber = (page: number, maxPage: number): boolean => {
  return Number.isInteger(page) && page >= 0 && page < maxPage;
};

export const validatePageSize = (size: number): boolean => {
  return Number.isInteger(size) && size > 0 && size <= 100;
};

export const validateSortField = (field: string, allowedFields: string[]): boolean => {
  return allowedFields.includes(field);
};

export const validateSortOrder = (order: string): boolean => {
  return ["asc", "desc"].includes(order.toLowerCase());
};
