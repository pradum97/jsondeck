import { Router } from "express";
import { documentRouter } from "../business/routes/documents";
import { projectRouter } from "../business/routes/projects";
import { authRouter } from "./auth";
import { billingRouter } from "./billing";
import { configRouter } from "./config";
import { healthRouter } from "./health";
import { uploadRouter } from "./upload";
import { transformRouter } from "./transform";

export const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use(billingRouter);
apiRouter.use("/config", configRouter);
apiRouter.use(projectRouter);
apiRouter.use(documentRouter);
apiRouter.use(uploadRouter);
apiRouter.use(transformRouter);
