import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { analyticsRouter } from "./routes/analytics";
import { authRouter } from "./routes/auth";
import { billingRouter } from "./routes/billing";
import { configRouter } from "./routes/config";
import { documentsRouter } from "./routes/documents";
import { projectsRouter } from "./routes/projects";
import { transformRouter } from "./routes/transform";
import { uploadRouter } from "./routes/upload";
import { env } from "./config/env";
import { errorHandler } from "./middleware/error-handler";
import { notFound } from "./middleware/not-found";
import { requestId } from "./middleware/request-id";
import { logger as httpLogger } from "./middlewares/logger";
import { rateLimiter } from "./middlewares/rate-limit";
import { validationMiddleware } from "./middlewares/validate";
import { cache } from "./services/cache";
import { gzipCompression } from "./middlewares/compression";

export const createApp = (): express.Express => {
  const app = express();

  app.disable("x-powered-by");
  app.use(requestId);
  app.use(httpLogger);
  app.use(rateLimiter);
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || env.corsOrigins.length === 0 || env.corsOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error("CORS origin denied"));
      },
      credentials: true,
    })
  );
  app.use(cookieParser());
  app.use(gzipCompression);
  app.use(
    express.json({
      limit: "2mb",
      verify: (req, _res, buf) => {
        (req as express.Request).rawBody = buf;
      },
    })
  );
  app.use(validationMiddleware);

  app.get("/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
      env: env.nodeEnv,
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/health/redis", async (_req, res) => {
    try {
      const status = await cache.ping();
      res.status(200).json({
        status: status.toLowerCase() === "pong" ? "ok" : "degraded",
        redis: status,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Redis health check failed";
      res.status(503).json({
        status: "down",
        redis: "unavailable",
        message,
        timestamp: new Date().toISOString(),
      });
    }
  });

  app.use("/api/auth", authRouter);
  app.use("/api", analyticsRouter);
  app.use("/api/projects", projectsRouter);
  app.use("/api/documents", documentsRouter);
  app.use("/api/config", configRouter);
  app.use("/api", billingRouter);
  app.use("/api", uploadRouter);
  app.use("/api", transformRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
