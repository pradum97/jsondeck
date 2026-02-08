import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { connectProviderHandler, getProfileHandler, upsertProfileHandler } from "../controllers/auth-controller";

export const authRouter = Router();

authRouter.use(requireAuth);

authRouter.get("/auth/profile", getProfileHandler);
authRouter.patch("/auth/profile", upsertProfileHandler);
authRouter.post("/auth/providers", connectProviderHandler);
