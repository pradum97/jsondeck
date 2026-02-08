import { AppError } from "../middleware/error-handler";

export const ensureNumber = (value: unknown, field: string): number => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new AppError(`${field} must be a number`, 400);
  }
  return value;
};

export const ensurePositiveInt = (value: unknown, field: string): number => {
  const numeric = ensureNumber(value, field);
  if (!Number.isInteger(numeric) || numeric <= 0) {
    throw new AppError(`${field} must be a positive integer`, 400);
  }
  return numeric;
};
