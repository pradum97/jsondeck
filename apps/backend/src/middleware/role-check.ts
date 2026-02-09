import type { NextFunction, Request, Response } from "express";
import { SubscriptionModel } from "../business/models/subscription";
import { AppError } from "./error-handler";

type Role = "free" | "pro" | "team";

const resolveRole = (subscription: {
  status?: string;
  currentPeriodEnd?: Date;
  seats?: number;
  planCode?: string;
} | null): Role => {
  if (!subscription) {
    return "free";
  }
  if (subscription.planCode === "free") {
    return "free";
  }
  const status = subscription.status ?? "";
  const active = ["active", "trialing", "past_due"].includes(status);
  if (!active) {
    return "free";
  }
  if (!subscription.currentPeriodEnd || subscription.currentPeriodEnd.getTime() <= Date.now()) {
    return "free";
  }
  if ((subscription.seats ?? 1) > 1) {
    return "team";
  }
  return "pro";
};

export const attachRole = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const subject = req.auth?.subject;
  if (!subject) {
    next(new AppError("Missing authenticated subject", 401));
    return;
  }

  try {
    const subscription = await SubscriptionModel.findOne({ userId: subject }).sort({ currentPeriodEnd: -1 }).lean();
    const role = resolveRole(subscription);
    const roles = new Set([...(req.auth?.roles ?? []), role]);

    if (req.auth) {
      req.auth.roles = Array.from(roles);
    }

    (req as Request & { role?: Role }).role = role;
    next();
  } catch (error) {
    next(error as Error);
  }
};
