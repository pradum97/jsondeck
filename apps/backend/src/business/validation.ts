import { AppError } from "../middleware/error-handler";

export const ensureString = (value: unknown, field: string): string => {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new AppError(`${field} is required`, 400);
  }
  return value.trim();
};

export const ensureEmail = (value: unknown, field: string): string => {
  const email = ensureString(value, field);
  if (!email.includes("@")) {
    throw new AppError(`${field} must be a valid email`, 400);
  }
  return email.toLowerCase();
};

export const ensureOptionalString = (value: unknown): string | undefined => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  if (typeof value !== "string") {
    throw new AppError("Invalid string value", 400);
  }
  return value.trim();
};

export const ensureBoolean = (value: unknown, field: string): boolean => {
  if (typeof value !== "boolean") {
    throw new AppError(`${field} must be a boolean`, 400);
  }
  return value;
};

export const ensureStringArray = (value: unknown, field: string): string[] => {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new AppError(`${field} must be an array of strings`, 400);
  }
  return value.map((item) => item.trim()).filter((item) => item.length > 0);
};

export const ensureObject = (value: unknown, field: string): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new AppError(`${field} must be an object`, 400);
  }
  return value as Record<string, unknown>;
};
