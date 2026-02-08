import { AppError } from "../../middleware/error-handler";
import { BillingPlanModel, type BillingInterval } from "../models/billing-plan";
import { SubscriptionModel, type SubscriptionStatus } from "../models/subscription";

export interface BillingPlanInput {
  planCode: string;
  name: string;
  description?: string;
  priceMonthlyCents: number;
  priceYearlyCents: number;
  features: string[];
  createdBy: string;
}

export interface SubscriptionInput {
  userId: string;
  planCode: string;
  interval: BillingInterval;
  seats: number;
  status?: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd?: boolean;
}

export const createBillingPlan = async (input: BillingPlanInput) => {
  const plan = await BillingPlanModel.create({
    planCode: input.planCode,
    name: input.name,
    description: input.description,
    priceMonthlyCents: input.priceMonthlyCents,
    priceYearlyCents: input.priceYearlyCents,
    features: input.features,
    createdBy: input.createdBy,
  });

  return plan.toObject();
};

export const listBillingPlans = async () => {
  const plans = await BillingPlanModel.find({ isActive: true }).sort({ priceMonthlyCents: 1 }).lean();
  return plans;
};

export const createSubscription = async (input: SubscriptionInput) => {
  const plan = await BillingPlanModel.findOne({ planCode: input.planCode, isActive: true }).lean();
  if (!plan) {
    throw new AppError("Billing plan is not available", 404);
  }

  const subscription = await SubscriptionModel.findOneAndUpdate(
    { userId: input.userId },
    {
      $set: {
        planCode: input.planCode,
        interval: input.interval,
        seats: input.seats,
        status: input.status ?? "active",
        currentPeriodStart: input.currentPeriodStart,
        currentPeriodEnd: input.currentPeriodEnd,
        cancelAtPeriodEnd: input.cancelAtPeriodEnd ?? false,
      },
    },
    { new: true, upsert: true }
  ).lean();

  if (!subscription) {
    throw new AppError("Unable to create subscription", 500);
  }

  return subscription;
};

export const getActiveSubscription = async (userId: string) => {
  const subscription = await SubscriptionModel.findOne({ userId }).lean();
  if (!subscription) {
    throw new AppError("Subscription not found", 404);
  }
  return subscription;
};
