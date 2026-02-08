import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler";
import { ensureOptionalString, ensureString } from "../validation";
import {
  createCollection,
  deleteCollection,
  getCollection,
  listCollections,
  updateCollection,
} from "../services/collection-service";

export const createCollectionHandler = asyncHandler(async (req: Request, res: Response) => {
  const projectId = ensureString(req.body?.projectId, "projectId");
  const name = ensureString(req.body?.name, "name");
  const description = ensureOptionalString(req.body?.description);
  const collection = await createCollection({ projectId, name, description }, req.auth?.subject ?? "");
  res.status(201).json({ collection });
});

export const listCollectionsHandler = asyncHandler(async (req: Request, res: Response) => {
  const projectId = ensureString(req.params.projectId, "projectId");
  const collections = await listCollections(projectId, req.auth?.subject ?? "");
  res.status(200).json({ collections });
});

export const getCollectionHandler = asyncHandler(async (req: Request, res: Response) => {
  const collectionId = ensureString(req.params.collectionId, "collectionId");
  const collection = await getCollection(collectionId, req.auth?.subject ?? "");
  res.status(200).json({ collection });
});

export const updateCollectionHandler = asyncHandler(async (req: Request, res: Response) => {
  const collectionId = ensureString(req.params.collectionId, "collectionId");
  const name = ensureOptionalString(req.body?.name);
  const description = ensureOptionalString(req.body?.description);
  const collection = await updateCollection(
    collectionId,
    req.auth?.subject ?? "",
    {
      name: name ?? undefined,
      description,
    }
  );
  res.status(200).json({ collection });
});

export const deleteCollectionHandler = asyncHandler(async (req: Request, res: Response) => {
  const collectionId = ensureString(req.params.collectionId, "collectionId");
  await deleteCollection(collectionId, req.auth?.subject ?? "");
  res.status(204).send();
});
