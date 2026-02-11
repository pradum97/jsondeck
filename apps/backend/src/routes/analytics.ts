import { Router } from "express";
import { getAnalyticsRevenueHandler, getAnalyticsSummaryHandler, getAnalyticsUsageHandler } from "../business/controllers/analytics-controller";
import { requireAuth } from "../middleware/auth";
import { requireAdminRole } from "../middleware/admin-role-check";

export const analyticsRouter = Router();

analyticsRouter.use(requireAuth, requireAdminRole);

analyticsRouter.get("/analytics/summary", getAnalyticsSummaryHandler);
analyticsRouter.get("/analytics/usage", getAnalyticsUsageHandler);
analyticsRouter.get("/analytics/revenue", getAnalyticsRevenueHandler);
