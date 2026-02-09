import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import {
  createDocumentHandler,
  deleteDocumentHandler,
  getDocumentHandler,
  listDocumentsHandler,
  updateDocumentHandler,
} from "../controllers/document-controller";

export const documentRouter = Router();

documentRouter.use(requireAuth);

documentRouter.post("/documents", createDocumentHandler);
documentRouter.get("/documents", listDocumentsHandler);
documentRouter.get("/documents/:documentId", getDocumentHandler);
documentRouter.patch("/documents/:documentId", updateDocumentHandler);
documentRouter.delete("/documents/:documentId", deleteDocumentHandler);
