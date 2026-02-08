import { Router, type Request, type Response, type NextFunction } from "express";
import Razorpay from "razorpay";
import { requireAuth } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";
import { logger } from "../config/logger";
import { BillingPlanModel, type BillingInterval } from "../business/models/billing-plan";
import { createSubscription } from "../business/services/billing-service";
import { getRazorpayClient, getRazorpayKeyId, getRazorpayWebhookSecret } from "../services/razorpay";

export const billingRouter = Router();

const allowedPlans = new Set(["free", "pro", "team"]);

const parseInterval = (value: unknown): BillingInterval => {
  if (value === "month" || value === "year") {
    return value;
  }
  throw new AppError("Invalid billing interval", 400);
};

const parseSeats = (value: unknown): number => {
  if (value === undefined) {
    return 1;
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new AppError("Invalid seat count", 400);
  }
  return parsed;
};

const parsePlanCode = (value: unknown): string => {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new AppError("Invalid plan code", 400);
  }
  const planCode = value.trim();
  if (!allowedPlans.has(planCode)) {
    throw new AppError("Unsupported plan code", 400);
  }
  return planCode;
};

const addInterval = (start: Date, interval: BillingInterval): Date => {
  const next = new Date(start);
  if (interval === "year") {
    next.setFullYear(next.getFullYear() + 1);
  } else {
    next.setMonth(next.getMonth() + 1);
  }
  return next;
};

billingRouter.post(
  "/billing/checkout",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const planCode = parsePlanCode(req.body?.planCode);
      const interval = parseInterval(req.body?.interval);
      const seats = parseSeats(req.body?.seats);

      const plan = await BillingPlanModel.findOne({ planCode, isActive: true }).lean();
      if (!plan) {
        throw new AppError("Billing plan is not available", 404);
      }

      const amount = interval === "year" ? plan.priceYearlyCents : plan.priceMonthlyCents;
      if (amount <= 0) {
        throw new AppError("Selected plan is not billable", 400);
      }

      const razorpay = getRazorpayClient();
      const receipt = `sub_${req.auth?.subject ?? "user"}_${Date.now()}`;

      const order = await razorpay.orders.create({
        amount,
        currency: "INR",
        receipt,
        notes: {
          planCode,
          interval,
          seats: String(seats),
          userId: req.auth?.subject ?? "",
        },
      });

      res.status(200).json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        razorpayKeyId: getRazorpayKeyId(),
        planCode,
        interval,
        seats,
      });
    } catch (error) {
      next(error);
    }
  }
);

billingRouter.post(
  "/billing/webhook",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const signature = req.header("x-razorpay-signature");
      if (!signature) {
        throw new AppError("Missing Razorpay signature", 400);
      }

      const rawBody = req.rawBody;
      if (!rawBody) {
        throw new AppError("Missing webhook payload", 400);
      }

      const secret = getRazorpayWebhookSecret();
      const isValid = Razorpay.validateWebhookSignature(rawBody.toString("utf8"), signature, secret);
      if (!isValid) {
        throw new AppError("Invalid webhook signature", 401);
      }

      const event = req.body?.event as string | undefined;
      if (!event) {
        throw new AppError("Missing webhook event", 400);
      }

      if (![
        "payment.captured",
        "order.paid",
        "subscription.charged",
      ].includes(event)) {
        res.status(200).json({ received: true });
        return;
      }

      const payload = req.body?.payload ?? {};
      const paymentEntity = payload.payment?.entity;
      const orderEntity = payload.order?.entity;
      const subscriptionEntity = payload.subscription?.entity;
      const notes = paymentEntity?.notes ?? orderEntity?.notes ?? subscriptionEntity?.notes ?? {};

      const planCode = parsePlanCode(notes.planCode);
      const interval = parseInterval(notes.interval);
      const seats = parseSeats(notes.seats);
      const userId = typeof notes.userId === "string" ? notes.userId : undefined;

      if (!userId) {
        throw new AppError("Missing userId in webhook payload", 400);
      }

      const now = new Date();
      const currentPeriodEnd = addInterval(now, interval);

      await createSubscription({
        userId,
        planCode,
        interval,
        seats,
        status: "active",
        currentPeriodStart: now,
        currentPeriodEnd,
        cancelAtPeriodEnd: false,
      });

      res.status(200).json({ received: true });
    } catch (error) {
      logger.error("Razorpay webhook handling failed", { error });
      next(error);
    }
  }
);
