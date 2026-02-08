import { Router } from "express";
import { apiRequestRouter } from "./api-requests";
import { collectionRouter } from "./collections";
import { projectRouter } from "./projects";
import { workspaceRouter } from "./workspaces";

export const businessRouter = Router();

businessRouter.use(workspaceRouter);
businessRouter.use(projectRouter);
businessRouter.use(collectionRouter);
businessRouter.use(apiRequestRouter);
