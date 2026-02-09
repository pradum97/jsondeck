import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { attachRole, requireRole } from "../middleware/role-check";
import {
  createDocumentHandler,
  deleteDocumentHandler,
  getDocumentHandler,
  listDocumentsHandler,
  updateDocumentHandler,
} from "../business/controllers/document-controller";

export const documentsRouter = Router();

documentsRouter.use(requireAuth, attachRole, requireRole(["free", "pro", "team"]));

documentsRouter.post("/", createDocumentHandler);
documentsRouter.get("/", listDocumentsHandler);
documentsRouter.get("/:documentId", getDocumentHandler);
documentsRouter.patch("/:documentId", updateDocumentHandler);
documentsRouter.delete("/:documentId", deleteDocumentHandler);
