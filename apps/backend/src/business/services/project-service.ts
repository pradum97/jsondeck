import { AppError } from "../../middleware/error-handler";
import { ProjectModel, type ProjectDocument } from "../models/project";
import type { ProjectInput } from "../types";
import { WorkspaceModel } from "../models/workspace";

export const createProject = async (input: ProjectInput, userId: string): Promise<ProjectDocument> => {
  const workspace = await WorkspaceModel.findById(input.workspaceId).exec();
  if (!workspace) {
    throw new AppError("Workspace not found", 404);
  }
  if (!workspace.memberIds.includes(userId)) {
    throw new AppError("Access denied", 403);
  }

  const project = await ProjectModel.create({
    workspaceId: input.workspaceId,
    name: input.name,
    description: input.description,
    createdBy: userId,
  });

  return project;
};

export const listProjects = async (workspaceId: string, userId: string): Promise<ProjectDocument[]> => {
  const workspace = await WorkspaceModel.findById(workspaceId).exec();
  if (!workspace) {
    throw new AppError("Workspace not found", 404);
  }
  if (!workspace.memberIds.includes(userId)) {
    throw new AppError("Access denied", 403);
  }
  return ProjectModel.find({ workspaceId }).sort({ updatedAt: -1 }).exec();
};

export const getProject = async (projectId: string, userId: string): Promise<ProjectDocument> => {
  const project = await ProjectModel.findById(projectId).exec();
  if (!project) {
    throw new AppError("Project not found", 404);
  }
  const workspace = await WorkspaceModel.findById(project.workspaceId).exec();
  if (!workspace || !workspace.memberIds.includes(userId)) {
    throw new AppError("Access denied", 403);
  }
  return project;
};

export const updateProject = async (
  projectId: string,
  userId: string,
  updates: Partial<ProjectInput>
): Promise<ProjectDocument> => {
  const project = await getProject(projectId, userId);
  if (updates.name) {
    project.name = updates.name;
  }
  if (updates.description !== undefined) {
    project.description = updates.description;
  }
  await project.save();
  return project;
};

export const deleteProject = async (projectId: string, userId: string): Promise<void> => {
  await getProject(projectId, userId);
  await ProjectModel.deleteOne({ _id: projectId }).exec();
};
