import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import {
  createCollectionHandler,
  deleteCollectionHandler,
  getCollectionHandler,
  listCollectionsHandler,
  updateCollectionHandler,
} from "../controllers/collection-controller";

export const collectionRouter = Router();

collectionRouter.use(requireAuth);

collectionRouter.post("/collections", createCollectionHandler);
collectionRouter.get("/projects/:projectId/collections", listCollectionsHandler);
collectionRouter.get("/collections/:collectionId", getCollectionHandler);
collectionRouter.patch("/collections/:collectionId", updateCollectionHandler);
collectionRouter.delete("/collections/:collectionId", deleteCollectionHandler);
