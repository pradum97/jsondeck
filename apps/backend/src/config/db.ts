import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "./logger";

export const connectDatabase = async (): Promise<void> => {
  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(env.mongodbUri, {
      minPoolSize: 2,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
    });
    logger.info("MongoDB connection established");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error";
    logger.error("MongoDB connection failed", { message });
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
  logger.info("MongoDB connection closed");
};
