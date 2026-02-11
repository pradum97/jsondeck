import { AppError } from "../../middleware/error-handler";
import { DocumentModel, type DocumentDocument } from "../models/document";
import { ProjectModel } from "../models/project";
import { WorkspaceModel } from "../models/workspace";

type PaginationInput = {
  page?: number;
  limit?: number;
};

export interface DocumentInput {
  projectId: string;
  title: string;
  content?: string;
}

const ensureProjectAccess = async (projectId: string, userId: string) => {
  const project = await ProjectModel.findById(projectId)
    .select({ workspaceId: 1 })
    .lean()
    .exec();
  if (!project) {
    throw new AppError("Project not found", 404);
  }
  const workspace = await WorkspaceModel.findById(project.workspaceId)
    .select({ memberIds: 1 })
    .lean()
    .exec();
  if (!workspace || !workspace.memberIds.includes(userId)) {
    throw new AppError("Access denied", 403);
  }
  return project;
};

export const createDocument = async (input: DocumentInput, userId: string): Promise<DocumentDocument> => {
  await ensureProjectAccess(input.projectId, userId);
  const document = new DocumentModel({
    projectId: input.projectId,
    title: input.title,
    content: input.content,
    createdBy: userId,
  });
  return document.save();
};

export const listDocuments = async (
  projectId: string,
  userId: string,
  pagination?: PaginationInput
): Promise<DocumentDocument[]> => {
  await ensureProjectAccess(projectId, userId);
  const query = DocumentModel.find({ projectId }).sort({ updatedAt: -1 });

  if (pagination?.limit !== undefined) {
    const page = pagination.page ?? 1;
    query.skip((page - 1) * pagination.limit).limit(pagination.limit);
  }

  return query.exec();
};

export const getDocument = async (documentId: string, userId: string): Promise<DocumentDocument> => {
  const document = await DocumentModel.findById(documentId).exec();
  if (!document) {
    throw new AppError("Document not found", 404);
  }
  await ensureProjectAccess(document.projectId, userId);
  return document;
};

export const updateDocument = async (
  documentId: string,
  userId: string,
  updates: Partial<DocumentInput>
): Promise<DocumentDocument> => {
  const document = await getDocument(documentId, userId);
  if (updates.title) {
    document.title = updates.title;
  }
  if (updates.content !== undefined) {
    document.content = updates.content;
  }
  await document.save();
  return document;
};

export const deleteDocument = async (documentId: string, userId: string): Promise<void> => {
  await getDocument(documentId, userId);
  await DocumentModel.deleteOne({ _id: documentId }).exec();
};
