import mongoose from "mongoose";

type ConnectOptions = {
  maxRetries?: number;
  retryDelayMs?: number;
};

const DEFAULT_MAX_RETRIES = 5;
const DEFAULT_RETRY_DELAY_MS = 5000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const connectToDatabase = async (
  options: ConnectOptions = {},
): Promise<void> => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is not set");
  }

  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
  const retryDelayMs = options.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS;

  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      await mongoose.connect(mongoUri);
      console.log("MongoDB connected successfully");
      return;
    } catch (error) {
      attempt += 1;
      console.error(
        `MongoDB connection failed (attempt ${attempt}/${maxRetries})`,
        error,
      );
      if (attempt > maxRetries) {
        throw error;
      }
      await sleep(retryDelayMs);
    }
  }
};

export const registerDatabaseShutdown = (): void => {
  const shutdown = async (signal: string) => {
    try {
      await mongoose.connection.close();
      console.log(`MongoDB connection closed on ${signal}`);
      process.exit(0);
    } catch (error) {
      console.error(`MongoDB shutdown error on ${signal}`, error);
      process.exit(1);
    }
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
};
