import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { apiRouter } from "./routes";
import { env } from "./config/env";
import { errorHandler } from "./middleware/error-handler";
import { notFound } from "./middleware/not-found";
import { requestId } from "./middleware/request-id";
import { logger as httpLogger } from "./middlewares/logger";
import { rateLimiter } from "./middlewares/rate-limit";
import { validationMiddleware } from "./middlewares/validate";

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
  app.use(
    express.json({
      limit: "2mb",
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      },
    })
  );
  app.use(validationMiddleware);

  app.use("/api", apiRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
