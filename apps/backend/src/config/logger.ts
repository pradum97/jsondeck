import { env } from "./env";

export type LogLevel = "debug" | "info" | "warn" | "error";

const levelPriority: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const currentLevel = levelPriority[env.logLevel];

const formatMessage = (level: LogLevel, message: string, meta?: Record<string, unknown>): string => {
  const base = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };
  return JSON.stringify(base);
};

const shouldLog = (level: LogLevel): boolean => levelPriority[level] >= currentLevel;

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>): void => {
    if (shouldLog("debug")) {
      console.debug(formatMessage("debug", message, meta));
    }
  },
  info: (message: string, meta?: Record<string, unknown>): void => {
    if (shouldLog("info")) {
      console.info(formatMessage("info", message, meta));
    }
  },
  warn: (message: string, meta?: Record<string, unknown>): void => {
    if (shouldLog("warn")) {
      console.warn(formatMessage("warn", message, meta));
    }
  },
  error: (message: string, meta?: Record<string, unknown>): void => {
    if (shouldLog("error")) {
      console.error(formatMessage("error", message, meta));
    }
  },
};
