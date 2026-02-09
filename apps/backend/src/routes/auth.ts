import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import {
  connectProviderHandler,
  getProfileHandler,
  loginHandler,
  logoutHandler,
  requestOtpHandler,
  refreshHandler,
  upsertProfileHandler,
  verifyOtpHandler,
} from "../business/controllers/auth-session-controller";

export const authRouter = Router();

authRouter.post("/login", loginHandler);
authRouter.post("/logout", logoutHandler);
authRouter.post("/refresh", refreshHandler);
authRouter.post("/otp/request", requestOtpHandler);
authRouter.post("/otp/verify", verifyOtpHandler);

authRouter.use(requireAuth);
authRouter.get("/profile", getProfileHandler);
authRouter.patch("/profile", upsertProfileHandler);
authRouter.post("/providers", connectProviderHandler);
