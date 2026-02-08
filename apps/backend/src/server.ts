import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import { apiRouter } from "./routes";
import { errorHandler } from "./middlewares/error-handler";
import { logger } from "./middlewares/logger";
import { rateLimiter } from "./middlewares/rate-limit";
import { connectToDatabase, registerDatabaseShutdown } from "./utils/db";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(logger);
app.use(rateLimiter);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use(apiRouter);

app.use(errorHandler);

const port = Number(process.env.PORT) || 6000;

const startServer = async () => {
  await connectToDatabase();
  registerDatabaseShutdown();

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
