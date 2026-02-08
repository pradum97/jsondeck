import { Router } from "express";
import { documentRouter } from "../business/routes/documents";
import { projectRouter } from "../business/routes/projects";
import { authRouter } from "./auth";
import { billingRouter } from "./billing";
import { healthRouter } from "./health";

export const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use(authRouter);
apiRouter.use(billingRouter);
apiRouter.use(projectRouter);
apiRouter.use(documentRouter);
