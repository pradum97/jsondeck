import { Queue, Worker } from "bullmq";
import crypto from "crypto";
import { transformCache } from "../services/cache";

export type TransformJob = {
  input: string;
  operation: "format" | "minify" | "validate";
};

const connection = {
  host: process.env.REDIS_HOST ?? "127.0.0.1",
  port: Number(process.env.REDIS_PORT ?? 6379),
  password: process.env.REDIS_PASSWORD,
  tls: process.env.REDIS_TLS === "true" ? {} : undefined,
};

export const transformQueue = new Queue<TransformJob>("transform-queue", {
  connection,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: 50,
  },
});

const signatureForJob = (job: TransformJob) =>
  crypto
    .createHash("sha256")
    .update(`${job.operation}:${job.input}`)
    .digest("hex");

const executeTransform = (job: TransformJob) => {
  const trimmed = job.input.trim();
  if (!trimmed) {
    return { status: "invalid", output: "", message: "Input is empty." };
  }
  try {
    const parsed = JSON.parse(trimmed);
    if (job.operation === "validate") {
      return { status: "valid", output: "", message: "Valid JSON" };
    }
    if (job.operation === "minify") {
      return { status: "valid", output: JSON.stringify(parsed), message: "Minified" };
    }
    return {
      status: "valid",
      output: JSON.stringify(parsed, null, 2),
      message: "Formatted",
    };
  } catch (error) {
    return {
      status: "invalid",
      output: "",
      message: error instanceof Error ? error.message : "Invalid JSON",
    };
  }
};

export const transformWorker = new Worker<TransformJob>(
  "transform-queue",
  async (job) => {
    const signature = signatureForJob(job.data);
    const cached = await transformCache.get(signature);
    if (cached) return cached;

    const result = executeTransform(job.data);
    await transformCache.set(signature, result);
    return result;
  },
  { connection }
);
