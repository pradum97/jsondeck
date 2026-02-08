import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import {
  createApiRequestHandler,
  deleteApiRequestHandler,
  getApiRequestHandler,
  listApiRequestsHandler,
  updateApiRequestHandler,
} from "../controllers/api-request-controller";

export const apiRequestRouter = Router();

apiRequestRouter.use(requireAuth);

apiRequestRouter.post("/requests", createApiRequestHandler);
apiRequestRouter.get("/collections/:collectionId/requests", listApiRequestsHandler);
apiRequestRouter.get("/requests/:requestId", getApiRequestHandler);
apiRequestRouter.patch("/requests/:requestId", updateApiRequestHandler);
apiRequestRouter.delete("/requests/:requestId", deleteApiRequestHandler);
