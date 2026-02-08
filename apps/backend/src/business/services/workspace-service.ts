import { AppError } from "../../middleware/error-handler";
import { WorkspaceModel, type WorkspaceDocument } from "../models/workspace";
import type { WorkspaceInput } from "../types";

export const createWorkspace = async (input: WorkspaceInput, ownerId: string): Promise<WorkspaceDocument> => {
  const workspace = await WorkspaceModel.create({
    name: input.name,
    description: input.description,
    ownerId,
    memberIds: [ownerId],
  });
  return workspace;
};

export const listWorkspaces = async (userId: string): Promise<WorkspaceDocument[]> => {
  return WorkspaceModel.find({ memberIds: userId }).sort({ updatedAt: -1 }).exec();
};

export const getWorkspace = async (workspaceId: string, userId: string): Promise<WorkspaceDocument> => {
  const workspace = await WorkspaceModel.findById(workspaceId).exec();
  if (!workspace) {
    throw new AppError("Workspace not found", 404);
  }
  if (!workspace.memberIds.includes(userId)) {
    throw new AppError("Access denied", 403);
  }
  return workspace;
};

export const updateWorkspace = async (
  workspaceId: string,
  userId: string,
  updates: Partial<WorkspaceInput>
): Promise<WorkspaceDocument> => {
  const workspace = await getWorkspace(workspaceId, userId);
  if (updates.name) {
    workspace.name = updates.name;
  }
  if (updates.description !== undefined) {
    workspace.description = updates.description;
  }
  await workspace.save();
  return workspace;
};

export const deleteWorkspace = async (workspaceId: string, userId: string): Promise<void> => {
  const workspace = await getWorkspace(workspaceId, userId);
  if (workspace.ownerId !== userId) {
    throw new AppError("Only the owner can delete this workspace", 403);
  }
  await WorkspaceModel.deleteOne({ _id: workspaceId }).exec();
};
