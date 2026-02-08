import express from "express";
import { apiRouter } from "./routes";
import { errorHandler } from "./middleware/error-handler";
import { notFound } from "./middleware/not-found";
import { cors, securityHeaders } from "./middleware/security";
import { requestId } from "./middleware/request-id";

export const createApp = (): express.Express => {
  const app = express();

  app.disable("x-powered-by");
  app.use(securityHeaders);
  app.use(cors);
  app.use(requestId);
  app.use(
    express.json({
      limit: "2mb",
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      },
    })
  );

  app.use("/api", apiRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
