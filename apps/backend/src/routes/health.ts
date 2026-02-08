import { Router } from "express";
import { env } from "../config/env";

export const healthRouter = Router();

healthRouter.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    env: env.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});
