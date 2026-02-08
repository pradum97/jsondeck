import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST ?? "127.0.0.1",
  port: Number(process.env.REDIS_PORT ?? 6379),
  password: process.env.REDIS_PASSWORD,
  tls: process.env.REDIS_TLS === "true" ? {} : undefined,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
});

const TRANSFORM_CACHE_TTL = Number(process.env.TRANSFORM_CACHE_TTL ?? 300);
const CONFIG_CACHE_TTL = Number(process.env.CONFIG_CACHE_TTL ?? 900);
const SHARE_CACHE_TTL = Number(process.env.SHARE_CACHE_TTL ?? 86400);

const buildKey = (namespace: string, key: string) => `${namespace}:${key}`;

const safeJsonParse = <T>(value: string | null): T | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

export const cache = {
  client: redis,
  async get<T>(key: string): Promise<T | null> {
    const value = await redis.get(key);
    return safeJsonParse<T>(value);
  },
  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  },
  async del(key: string): Promise<void> {
    await redis.del(key);
  },
};

export const transformCache = {
  async get<Result>(signature: string): Promise<Result | null> {
    return cache.get<Result>(buildKey("transform", signature));
  },
  async set<Result>(signature: string, result: Result): Promise<void> {
    await cache.set(buildKey("transform", signature), result, TRANSFORM_CACHE_TTL);
  },
};

export const configCache = {
  async get<Config>(name: string): Promise<Config | null> {
    return cache.get<Config>(buildKey("config", name));
  },
  async set<Config>(name: string, config: Config): Promise<void> {
    await cache.set(buildKey("config", name), config, CONFIG_CACHE_TTL);
  },
};

export const shareLinkCache = {
  async get<Payload>(shareId: string): Promise<Payload | null> {
    return cache.get<Payload>(buildKey("share", shareId));
  },
  async set<Payload>(shareId: string, payload: Payload): Promise<void> {
    await cache.set(buildKey("share", shareId), payload, SHARE_CACHE_TTL);
  },
};

export const cacheKeys = {
  transform: (signature: string) => buildKey("transform", signature),
  config: (name: string) => buildKey("config", name),
  share: (shareId: string) => buildKey("share", shareId),
};
