import type { RequestHandler } from "express";
import { AppError } from "../../middleware/error-handler";
import {
  getAnalyticsRevenue,
  getAnalyticsSummary,
  getAnalyticsUsage,
  parseAnalyticsRange,
} from "../services/analytics-service";

const resolveRange = (startDate?: string, endDate?: string) => {
  try {
    return parseAnalyticsRange(startDate, endDate);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid date range";
    throw new AppError(message, 400);
  }
};

export const getAnalyticsSummaryHandler: RequestHandler = async (req, res, next) => {
  try {
    const range = resolveRange(req.query.startDate as string | undefined, req.query.endDate as string | undefined);
    const summary = await getAnalyticsSummary(range);
    res.status(200).json(summary);
  } catch (error) {
    next(error);
  }
};

export const getAnalyticsUsageHandler: RequestHandler = async (req, res, next) => {
  try {
    const range = resolveRange(req.query.startDate as string | undefined, req.query.endDate as string | undefined);
    const usage = await getAnalyticsUsage(range);
    res.status(200).json(usage);
  } catch (error) {
    next(error);
  }
};

export const getAnalyticsRevenueHandler: RequestHandler = async (req, res, next) => {
  try {
    const range = resolveRange(req.query.startDate as string | undefined, req.query.endDate as string | undefined);
    const revenue = await getAnalyticsRevenue(range);
    res.status(200).json(revenue);
  } catch (error) {
    next(error);
  }
};
