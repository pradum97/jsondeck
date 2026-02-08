import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler";
import { ensureOptionalString, ensureString } from "../validation";
import { createWorkspace, deleteWorkspace, getWorkspace, listWorkspaces, updateWorkspace } from "../services/workspace-service";

export const createWorkspaceHandler = asyncHandler(async (req: Request, res: Response) => {
  const name = ensureString(req.body?.name, "name");
  const description = ensureOptionalString(req.body?.description);
  const workspace = await createWorkspace({ name, description }, req.auth?.subject ?? "");
  res.status(201).json({ workspace });
});

export const listWorkspacesHandler = asyncHandler(async (req: Request, res: Response) => {
  const workspaces = await listWorkspaces(req.auth?.subject ?? "");
  res.status(200).json({ workspaces });
});

export const getWorkspaceHandler = asyncHandler(async (req: Request, res: Response) => {
  const workspaceId = ensureString(req.params.workspaceId, "workspaceId");
  const workspace = await getWorkspace(workspaceId, req.auth?.subject ?? "");
  res.status(200).json({ workspace });
});

export const updateWorkspaceHandler = asyncHandler(async (req: Request, res: Response) => {
  const workspaceId = ensureString(req.params.workspaceId, "workspaceId");
  const name = ensureOptionalString(req.body?.name);
  const description = ensureOptionalString(req.body?.description);
  const workspace = await updateWorkspace(
    workspaceId,
    req.auth?.subject ?? "",
    {
      name: name ?? undefined,
      description,
    }
  );
  res.status(200).json({ workspace });
});

export const deleteWorkspaceHandler = asyncHandler(async (req: Request, res: Response) => {
  const workspaceId = ensureString(req.params.workspaceId, "workspaceId");
  await deleteWorkspace(workspaceId, req.auth?.subject ?? "");
  res.status(204).send();
});
