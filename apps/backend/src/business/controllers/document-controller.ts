import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler";
import { ensureOptionalString, ensureString } from "../validation";
import { createDocument, deleteDocument, getDocument, listDocuments, updateDocument } from "../services/document-service";

export const createDocumentHandler = asyncHandler(async (req: Request, res: Response) => {
  const projectId = ensureString(req.body?.projectId, "projectId");
  const title = ensureString(req.body?.title, "title");
  const content = ensureOptionalString(req.body?.content);
  const document = await createDocument({ projectId, title, content }, req.auth?.subject ?? "");
  res.status(201).json({ document });
});

export const listDocumentsHandler = asyncHandler(async (req: Request, res: Response) => {
  const projectId = ensureString(req.query.projectId, "projectId");
  const documents = await listDocuments(projectId, req.auth?.subject ?? "");
  res.status(200).json({ documents });
});

export const getDocumentHandler = asyncHandler(async (req: Request, res: Response) => {
  const documentId = ensureString(req.params.documentId, "documentId");
  const document = await getDocument(documentId, req.auth?.subject ?? "");
  res.status(200).json({ document });
});

export const updateDocumentHandler = asyncHandler(async (req: Request, res: Response) => {
  const documentId = ensureString(req.params.documentId, "documentId");
  const title = ensureOptionalString(req.body?.title);
  const content = ensureOptionalString(req.body?.content);
  const document = await updateDocument(
    documentId,
    req.auth?.subject ?? "",
    { title: title ?? undefined, content }
  );
  res.status(200).json({ document });
});

export const deleteDocumentHandler = asyncHandler(async (req: Request, res: Response) => {
  const documentId = ensureString(req.params.documentId, "documentId");
  await deleteDocument(documentId, req.auth?.subject ?? "");
  res.status(204).send();
});
