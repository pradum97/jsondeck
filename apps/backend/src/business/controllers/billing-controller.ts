import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler";
import { ensureOptionalString, ensureString, ensureStringArray } from "../validation";
import { ensureNumber, ensurePositiveInt } from "../number-validation";
import { AppError } from "../../middleware/error-handler";
import { createBillingPlan, createSubscription, getActiveSubscription, listBillingPlans } from "../services/billing-service";

const getSubject = (req: Request): string => {
  const subject = req.auth?.subject;
  if (!subject) {
    throw new AppError("Missing authenticated subject", 401);
  }
  return subject;
};

export const createPlanHandler = asyncHandler(async (req: Request, res: Response) => {
  const plan = await createBillingPlan({
    planCode: ensureString(req.body?.planCode, "planCode"),
    name: ensureString(req.body?.name, "name"),
    description: ensureOptionalString(req.body?.description),
    priceMonthlyCents: ensureNumber(req.body?.priceMonthlyCents, "priceMonthlyCents"),
    priceYearlyCents: ensureNumber(req.body?.priceYearlyCents, "priceYearlyCents"),
    features: ensureStringArray(req.body?.features, "features"),
    createdBy: getSubject(req),
  });

  res.status(201).json({ plan });
});

export const listPlansHandler = asyncHandler(async (_req: Request, res: Response) => {
  const plans = await listBillingPlans();
  res.status(200).json({ plans });
});

export const createSubscriptionHandler = asyncHandler(async (req: Request, res: Response) => {
  const subscription = await createSubscription({
    userId: getSubject(req),
    planCode: ensureString(req.body?.planCode, "planCode"),
    interval: ensureString(req.body?.interval, "interval") === "year" ? "year" : "month",
    seats: ensurePositiveInt(req.body?.seats, "seats"),
    status: req.body?.status ? (ensureString(req.body.status, "status") as "active" | "trialing" | "past_due" | "canceled") : undefined,
    currentPeriodStart: new Date(ensureString(req.body?.currentPeriodStart, "currentPeriodStart")),
    currentPeriodEnd: new Date(ensureString(req.body?.currentPeriodEnd, "currentPeriodEnd")),
    cancelAtPeriodEnd: req.body?.cancelAtPeriodEnd ? Boolean(req.body.cancelAtPeriodEnd) : undefined,
  });

  res.status(201).json({ subscription });
});

export const getSubscriptionHandler = asyncHandler(async (req: Request, res: Response) => {
  const subscription = await getActiveSubscription(getSubject(req));
  res.status(200).json({ subscription });
});
