import type { NextFunction, Request, Response } from "express";
import crypto from "node:crypto";
import { cache, cacheKeys } from "../services/cache";
import { logger } from "../config/logger";

type CacheNamespace = keyof typeof cacheKeys;

interface ReadCacheOptions {
  namespace: CacheNamespace;
  ttlSeconds: number;
  keyResolver?: (req: Request) => string;
}

interface InvalidateCacheOptions {
  namespaces: CacheNamespace[];
  keyResolver?: (req: Request) => string[];
}

const stableStringify = (value: unknown): string => {
  if (!value || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
    a.localeCompare(b)
  );
  return `{${entries
    .map(([key, nested]) => `${JSON.stringify(key)}:${stableStringify(nested)}`)
    .join(",")}}`;
};

const hashPayload = (value: string): string => crypto.createHash("sha256").update(value).digest("hex");

const resolveKey = (req: Request): string => {
  const raw = `${req.method}:${req.originalUrl}:${stableStringify(req.query)}:${stableStringify(req.body)}`;
  return hashPayload(raw);
};

export const readThroughCache = ({ namespace, ttlSeconds, keyResolver }: ReadCacheOptions) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const key = keyResolver ? keyResolver(req) : resolveKey(req);
      const namespacedKey = cacheKeys[namespace](key);
      const cached = await cache.get<unknown>(namespacedKey);

      if (cached !== null) {
        res.setHeader("x-cache", "HIT");
        res.status(200).json(cached);
        return;
      }

      const originalJson = res.json.bind(res);
      res.json = ((body: unknown) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          void cache.set(namespacedKey, body, ttlSeconds).catch((error: unknown) => {
            const message = error instanceof Error ? error.message : "Unknown cache set error";
            logger.warn("Cache set failed", { namespace, key: namespacedKey, message });
          });
        }

        res.setHeader("x-cache", "MISS");
        return originalJson(body);
      }) as Response["json"];

      next();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown cache read error";
      logger.warn("Cache read failed", { namespace, message });
      next();
    }
  };
};

const invalidateNamespace = async (namespace: CacheNamespace, key?: string): Promise<void> => {
  try {
    if (key) {
      await cache.del(cacheKeys[namespace](key));
      return;
    }
    await cache.delByPattern(cacheKeys[namespace]("*"));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown cache invalidate error";
    logger.warn("Cache invalidation failed", { namespace, message });
  }
};

export const invalidateCache = ({ namespaces, keyResolver }: InvalidateCacheOptions) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
      next();
      return;
    }

    res.on("finish", () => {
      if (res.statusCode >= 400) {
        return;
      }

      const keys = keyResolver ? keyResolver(req) : [];
      namespaces.forEach((namespace, index) => {
        void invalidateNamespace(namespace, keys[index]);
      });
    });

    next();
  };
};
