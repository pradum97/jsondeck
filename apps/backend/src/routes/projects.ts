import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import {
  createProjectHandler,
  deleteProjectHandler,
  getProjectHandler,
  listProjectsHandler,
  updateProjectHandler,
} from "../business/controllers/project-controller";

export const projectsRouter = Router();

projectsRouter.use(requireAuth);

projectsRouter.post("/", createProjectHandler);
projectsRouter.get("/", listProjectsHandler);
projectsRouter.get("/:projectId", getProjectHandler);
projectsRouter.patch("/:projectId", updateProjectHandler);
projectsRouter.delete("/:projectId", deleteProjectHandler);
