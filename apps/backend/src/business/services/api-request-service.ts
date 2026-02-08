import { AppError } from "../../middleware/error-handler";
import { ApiRequestModel, type ApiRequestDocument, type HttpMethod } from "../models/api-request";
import type { ApiRequestInput } from "../types";
import { CollectionModel } from "../models/collection";
import { ProjectModel } from "../models/project";
import { WorkspaceModel } from "../models/workspace";

const assertCollectionAccess = async (collectionId: string, userId: string): Promise<void> => {
  const collection = await CollectionModel.findById(collectionId).exec();
  if (!collection) {
    throw new AppError("Collection not found", 404);
  }
  const project = await ProjectModel.findById(collection.projectId).exec();
  if (!project) {
    throw new AppError("Project not found", 404);
  }
  const workspace = await WorkspaceModel.findById(project.workspaceId).exec();
  if (!workspace || !workspace.memberIds.includes(userId)) {
    throw new AppError("Access denied", 403);
  }
};

const sanitizeHeaders = (headers: Record<string, string>): Record<string, string> => {
  return Object.entries(headers).reduce<Record<string, string>>((acc, [key, value]) => {
    if (key.trim().length > 0) {
      acc[key.trim()] = value;
    }
    return acc;
  }, {});
};

export const createApiRequest = async (input: ApiRequestInput, userId: string): Promise<ApiRequestDocument> => {
  await assertCollectionAccess(input.collectionId, userId);
  const payload = {
    collectionId: input.collectionId,
    name: input.name,
    method: input.method as HttpMethod,
    url: input.url,
    headers: sanitizeHeaders(input.headers),
    body: input.body,
    isJson: input.isJson,
    createdBy: userId,
  };
  return ApiRequestModel.create(payload);
};

export const listApiRequests = async (collectionId: string, userId: string): Promise<ApiRequestDocument[]> => {
  await assertCollectionAccess(collectionId, userId);
  return ApiRequestModel.find({ collectionId }).sort({ updatedAt: -1 }).exec();
};

export const getApiRequest = async (requestId: string, userId: string): Promise<ApiRequestDocument> => {
  const request = await ApiRequestModel.findById(requestId).exec();
  if (!request) {
    throw new AppError("API request not found", 404);
  }
  await assertCollectionAccess(request.collectionId, userId);
  return request;
};

export const updateApiRequest = async (
  requestId: string,
  userId: string,
  updates: Partial<ApiRequestInput>
): Promise<ApiRequestDocument> => {
  const request = await getApiRequest(requestId, userId);
  if (updates.name) {
    request.name = updates.name;
  }
  if (updates.method) {
    request.method = updates.method as HttpMethod;
  }
  if (updates.url) {
    request.url = updates.url;
  }
  if (updates.headers) {
    request.headers = sanitizeHeaders(updates.headers);
  }
  if (updates.body !== undefined) {
    request.body = updates.body;
  }
  if (updates.isJson !== undefined) {
    request.isJson = updates.isJson;
  }
  await request.save();
  return request;
};

export const deleteApiRequest = async (requestId: string, userId: string): Promise<void> => {
  await getApiRequest(requestId, userId);
  await ApiRequestModel.deleteOne({ _id: requestId }).exec();
};
