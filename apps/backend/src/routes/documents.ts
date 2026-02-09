import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import {
  createDocumentHandler,
  deleteDocumentHandler,
  getDocumentHandler,
  listDocumentsHandler,
  updateDocumentHandler,
} from "../business/controllers/document-controller";

export const documentsRouter = Router();

documentsRouter.use(requireAuth);

documentsRouter.post("/", createDocumentHandler);
documentsRouter.get("/", listDocumentsHandler);
documentsRouter.get("/:documentId", getDocumentHandler);
documentsRouter.patch("/:documentId", updateDocumentHandler);
documentsRouter.delete("/:documentId", deleteDocumentHandler);
