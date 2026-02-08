import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import {
  createPlanHandler,
  createSubscriptionHandler,
  getSubscriptionHandler,
  listPlansHandler,
} from "../controllers/billing-controller";

export const billingRouter = Router();

billingRouter.use(requireAuth);

billingRouter.post("/billing/plans", createPlanHandler);
billingRouter.get("/billing/plans", listPlansHandler);
billingRouter.post("/billing/subscriptions", createSubscriptionHandler);
billingRouter.get("/billing/subscriptions/current", getSubscriptionHandler);
