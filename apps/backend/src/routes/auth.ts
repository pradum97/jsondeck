import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import {
  connectProviderHandler,
  getProfileHandler,
  loginHandler,
  logoutHandler,
  refreshHandler,
  upsertProfileHandler,
} from "../business/controllers/auth-session-controller";

export const authRouter = Router();

authRouter.post("/login", loginHandler);
authRouter.post("/logout", logoutHandler);
authRouter.post("/refresh", refreshHandler);

authRouter.use(requireAuth);
authRouter.get("/profile", getProfileHandler);
authRouter.patch("/profile", upsertProfileHandler);
authRouter.post("/providers", connectProviderHandler);
