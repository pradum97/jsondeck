export type NodeEnv = "development" | "production" | "test";

export interface EnvConfig {
  nodeEnv: NodeEnv;
  port: number;
  mongodbUri: string;
  jwtSecret: string;
  jwtIssuer: string;
  jwtAudience: string;
  corsOrigins: string[];
  redisHost: string;
  redisPort: number;
  redisPassword?: string;
  redisTls: boolean;
  logLevel: "debug" | "info" | "warn" | "error";
}

const requireValue = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const parsePort = (value: string | undefined): number => {
  const port = Number(value ?? "6000");
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("PORT must be a positive integer");
  }
  return port;
};

const parseNodeEnv = (value: string | undefined): NodeEnv => {
  const env = value ?? "development";
  if (env !== "development" && env !== "production" && env !== "test") {
    throw new Error("NODE_ENV must be development, production, or test");
  }
  return env;
};

const parseCorsOrigins = (value: string | undefined): string[] => {
  if (!value) return [];
  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
};

const parseRedisPort = (value: string | undefined): number => {
  const port = Number(value);
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("REDIS_PORT must be a positive integer");
  }
  return port;
};

const parseLogLevel = (value: string | undefined): EnvConfig["logLevel"] => {
  const level = value ?? "info";
  if (level !== "debug" && level !== "info" && level !== "warn" && level !== "error") {
    throw new Error("LOG_LEVEL must be debug, info, warn, or error");
  }
  return level;
};

export const env: EnvConfig = {
  nodeEnv: parseNodeEnv(process.env.NODE_ENV),
  port: parsePort(process.env.PORT),
  mongodbUri: requireValue("MONGODB_URI"),
  jwtSecret: requireValue("JWT_SECRET"),
  jwtIssuer: requireValue("JWT_ISSUER"),
  jwtAudience: requireValue("JWT_AUDIENCE"),
  corsOrigins: parseCorsOrigins(process.env.CORS_ORIGINS),
  redisHost: requireValue("REDIS_HOST"),
  redisPort: parseRedisPort(process.env.REDIS_PORT),
  redisPassword: process.env.REDIS_PASSWORD,
  redisTls: process.env.REDIS_TLS === "true",
  logLevel: parseLogLevel(process.env.LOG_LEVEL),
};
