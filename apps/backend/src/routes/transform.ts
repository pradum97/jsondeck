import { Router } from "express";
import { QueueEvents } from "bullmq";
import { transformQueue, type TransformJob } from "../jobs/transform-queue";
import { env } from "../config/env";
import { readThroughCache } from "../middlewares/cache";

export const transformRouter = Router();

const TRANSFORM_CACHE_TTL = Number(process.env.TRANSFORM_CACHE_TTL ?? 300);

const connection = {
  host: env.redisHost,
  port: env.redisPort,
  password: env.redisPassword,
  tls: env.redisTls ? {} : undefined,
};

const queueEvents = new QueueEvents("transform-queue", { connection });

transformRouter.post(
  "/transform",
  readThroughCache({ namespace: "transform", ttlSeconds: TRANSFORM_CACHE_TTL }),
  async (req, res, next) => {
    try {
      const { input, operation } = req.body as TransformJob;
      if (!input || !operation) {
        res.status(400).json({ error: "Input and operation are required." });
        return;
      }
      if (!["format", "minify", "validate"].includes(operation)) {
        res.status(400).json({ error: "Unsupported operation." });
        return;
      }

      const job = await transformQueue.add("transform", { input, operation });
      const result = await job.waitUntilFinished(queueEvents, 15_000);

      res.status(200).json({ jobId: job.id, result });
    } catch (error) {
      next(error);
    }
  }
);
