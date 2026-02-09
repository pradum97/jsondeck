import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { errorHandler } from "./middlewares/error-handler";
import { rateLimiter } from "./middlewares/rate-limit";
import { validationMiddleware } from "./middlewares/validate";
import { authRouter } from "./routes/auth";
import { configRouter } from "./routes/config";
import { documentsRouter } from "./routes/documents";
import { projectsRouter } from "./routes/projects";
import { connectToDatabase, registerDatabaseShutdown } from "./utils/db";

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));
app.use(rateLimiter);
app.use(validationMiddleware);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/documents", documentsRouter);
app.use("/api/config", configRouter);

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
