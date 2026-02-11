import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { attachRole, requireRole } from "../middleware/role-check";
import { invalidateCache, readThroughCache } from "../middlewares/cache";
import {
  createConfigHandler,
  deleteConfigHandler,
  getConfigHandler,
  updateConfigHandler,
} from "../business/controllers/config-controller";

export const configRouter = Router();

const CONFIG_CACHE_TTL = Number(process.env.CONFIG_CACHE_TTL ?? 900);

configRouter.use(requireAuth, attachRole, requireRole(["free", "pro", "team"]));

configRouter.get(
  "/",
  readThroughCache({
    namespace: "config",
    ttlSeconds: CONFIG_CACHE_TTL,
    keyResolver: (req) => req.auth?.subject ?? "anonymous",
  }),
  getConfigHandler
);

configRouter.post(
  "/",
  invalidateCache({
    namespaces: ["config"],
    keyResolver: (req) => [req.auth?.subject ?? "anonymous"],
  }),
  createConfigHandler
);

configRouter.put(
  "/",
  invalidateCache({
    namespaces: ["config"],
    keyResolver: (req) => [req.auth?.subject ?? "anonymous"],
  }),
  updateConfigHandler
);

configRouter.delete(
  "/",
  invalidateCache({
    namespaces: ["config"],
    keyResolver: (req) => [req.auth?.subject ?? "anonymous"],
  }),
  deleteConfigHandler
);
