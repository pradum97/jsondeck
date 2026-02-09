import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler";
import { ensureOptionalString, ensureString } from "../validation";
import { createProject, deleteProject, getProject, listProjects, updateProject } from "../services/project-service";

export const createProjectHandler = asyncHandler(async (req: Request, res: Response) => {
  const workspaceId = ensureString(req.body?.workspaceId, "workspaceId");
  const name = ensureString(req.body?.name, "name");
  const description = ensureOptionalString(req.body?.description);
  const project = await createProject({ workspaceId, name, description }, req.auth?.subject ?? "");
  res.status(201).json({ project });
});

export const listProjectsHandler = asyncHandler(async (req: Request, res: Response) => {
  const workspaceId = ensureString(req.query.workspaceId, "workspaceId");
  const projects = await listProjects(workspaceId, req.auth?.subject ?? "");
  res.status(200).json({ projects });
});

export const getProjectHandler = asyncHandler(async (req: Request, res: Response) => {
  const projectId = ensureString(req.params.projectId, "projectId");
  const project = await getProject(projectId, req.auth?.subject ?? "");
  res.status(200).json({ project });
});

export const updateProjectHandler = asyncHandler(async (req: Request, res: Response) => {
  const projectId = ensureString(req.params.projectId, "projectId");
  const name = ensureOptionalString(req.body?.name);
  const description = ensureOptionalString(req.body?.description);
  const project = await updateProject(
    projectId,
    req.auth?.subject ?? "",
    {
      name: name ?? undefined,
      description,
    }
  );
  res.status(200).json({ project });
});

export const deleteProjectHandler = asyncHandler(async (req: Request, res: Response) => {
  const projectId = ensureString(req.params.projectId, "projectId");
  await deleteProject(projectId, req.auth?.subject ?? "");
  res.status(204).send();
});
