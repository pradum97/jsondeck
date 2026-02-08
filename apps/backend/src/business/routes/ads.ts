import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { getAdPreferenceHandler, upsertAdPreferenceHandler } from "../controllers/ad-controller";

export const adsRouter = Router();

adsRouter.use(requireAuth);

adsRouter.get("/ads/preferences", getAdPreferenceHandler);
adsRouter.put("/ads/preferences", upsertAdPreferenceHandler);
