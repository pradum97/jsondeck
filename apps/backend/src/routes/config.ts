import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { attachRole, requireRole } from "../middleware/role-check";
import {
  createConfigHandler,
  deleteConfigHandler,
  getConfigHandler,
  updateConfigHandler,
} from "../business/controllers/config-controller";

export const configRouter = Router();

configRouter.use(requireAuth, attachRole, requireRole(["free", "pro", "team"]));

configRouter.get("/", getConfigHandler);
configRouter.post("/", createConfigHandler);
configRouter.put("/", updateConfigHandler);
configRouter.delete("/", deleteConfigHandler);
