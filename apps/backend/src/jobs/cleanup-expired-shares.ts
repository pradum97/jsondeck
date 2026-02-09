import { Queue, Worker } from "bullmq";
import { cacheKeys, cache } from "../services/cache";
import { env } from "../config/env";

const connection = {
  host: env.redisHost,
  port: env.redisPort,
  password: env.redisPassword,
  tls: env.redisTls ? {} : undefined,
};

export const cleanupQueue = new Queue("cleanup-expired-shares", {
  connection,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: 25,
  },
});

const scanKeys = async (pattern: string) => {
  const keys: string[] = [];
  let cursor = "0";
  do {
    const [nextCursor, batch] = await cache.client.scan(
      cursor,
      "MATCH",
      pattern,
      "COUNT",
      "200"
    );
    cursor = nextCursor;
    keys.push(...batch);
  } while (cursor !== "0");
  return keys;
};

export const cleanupWorker = new Worker(
  "cleanup-expired-shares",
  async () => {
    const keys = await scanKeys(cacheKeys.share("*"));
    if (keys.length === 0) return { cleaned: 0 };

    const expiredKeys: string[] = [];
    for (const key of keys) {
      const ttl = await cache.client.ttl(key);
      if (ttl <= 0) {
        expiredKeys.push(key);
      }
    }

    if (expiredKeys.length > 0) {
      await cache.client.del(...expiredKeys);
    }

    return { cleaned: expiredKeys.length };
  },
  { connection }
);

export const scheduleCleanup = async () => {
  await cleanupQueue.add(
    "cleanup-expired-share-links",
    {},
    {
      repeat: {
        pattern: "0 * * * *",
      },
    }
  );
};
