import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import {
  createProjectHandler,
  deleteProjectHandler,
  getProjectHandler,
  listProjectsHandler,
  updateProjectHandler,
} from "../controllers/project-controller";

export const projectRouter = Router();

projectRouter.use(requireAuth);

projectRouter.post("/projects", createProjectHandler);
projectRouter.get("/workspaces/:workspaceId/projects", listProjectsHandler);
projectRouter.get("/projects/:projectId", getProjectHandler);
projectRouter.patch("/projects/:projectId", updateProjectHandler);
projectRouter.delete("/projects/:projectId", deleteProjectHandler);
