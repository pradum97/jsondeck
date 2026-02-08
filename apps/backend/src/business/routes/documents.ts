import { Router } from "express";
import { requireAuth } from "../../middleware/auth";

export const documentRouter = Router();

documentRouter.use(requireAuth);

documentRouter.get("/documents", (_req, res) => {
  res.status(200).json([]);
});
