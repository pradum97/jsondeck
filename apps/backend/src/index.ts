import { createServer } from "http";
import { createApp } from "./app";
import { connectDatabase, disconnectDatabase } from "./config/db";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { scheduleCleanup, cleanupWorker, transformWorker } from "./jobs";

const startServer = async (): Promise<void> => {
  await connectDatabase();

  const app = createApp();
  const server = createServer(app);

  void cleanupWorker;
  void transformWorker;
  await scheduleCleanup();

  server.listen(env.port, () => {
    logger.info("JSONDeck API server listening", { port: env.port });
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.warn("Shutdown signal received", { signal });
    server.close(async () => {
      await disconnectDatabase();
      logger.info("Server shut down");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
};

startServer().catch((error) => {
  const message = error instanceof Error ? error.message : "Unknown startup error";
  logger.error("Failed to start server", { message });
  process.exit(1);
});
