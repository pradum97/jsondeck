import { AppError } from "../../middleware/error-handler";
import { CollectionModel, type CollectionDocument } from "../models/collection";
import type { CollectionInput } from "../types";
import { ProjectModel } from "../models/project";
import { WorkspaceModel } from "../models/workspace";

const assertProjectAccess = async (projectId: string, userId: string): Promise<void> => {
  const project = await ProjectModel.findById(projectId).exec();
  if (!project) {
    throw new AppError("Project not found", 404);
  }
  const workspace = await WorkspaceModel.findById(project.workspaceId).exec();
  if (!workspace || !workspace.memberIds.includes(userId)) {
    throw new AppError("Access denied", 403);
  }
};

export const createCollection = async (input: CollectionInput, userId: string): Promise<CollectionDocument> => {
  await assertProjectAccess(input.projectId, userId);
  return CollectionModel.create({
    projectId: input.projectId,
    name: input.name,
    description: input.description,
    createdBy: userId,
  });
};

export const listCollections = async (projectId: string, userId: string): Promise<CollectionDocument[]> => {
  await assertProjectAccess(projectId, userId);
  return CollectionModel.find({ projectId }).sort({ updatedAt: -1 }).exec();
};

export const getCollection = async (collectionId: string, userId: string): Promise<CollectionDocument> => {
  const collection = await CollectionModel.findById(collectionId).exec();
  if (!collection) {
    throw new AppError("Collection not found", 404);
  }
  await assertProjectAccess(collection.projectId, userId);
  return collection;
};

export const updateCollection = async (
  collectionId: string,
  userId: string,
  updates: Partial<CollectionInput>
): Promise<CollectionDocument> => {
  const collection = await getCollection(collectionId, userId);
  if (updates.name) {
    collection.name = updates.name;
  }
  if (updates.description !== undefined) {
    collection.description = updates.description;
  }
  await collection.save();
  return collection;
};

export const deleteCollection = async (collectionId: string, userId: string): Promise<void> => {
  await getCollection(collectionId, userId);
  await CollectionModel.deleteOne({ _id: collectionId }).exec();
};
