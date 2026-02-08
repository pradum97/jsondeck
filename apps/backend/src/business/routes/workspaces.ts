import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import {
  createWorkspaceHandler,
  deleteWorkspaceHandler,
  getWorkspaceHandler,
  listWorkspacesHandler,
  updateWorkspaceHandler,
} from "../controllers/workspace-controller";

export const workspaceRouter = Router();

workspaceRouter.use(requireAuth);

workspaceRouter.post("/workspaces", createWorkspaceHandler);
workspaceRouter.get("/workspaces", listWorkspacesHandler);
workspaceRouter.get("/workspaces/:workspaceId", getWorkspaceHandler);
workspaceRouter.patch("/workspaces/:workspaceId", updateWorkspaceHandler);
workspaceRouter.delete("/workspaces/:workspaceId", deleteWorkspaceHandler);
