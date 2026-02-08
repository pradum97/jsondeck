import mongoose, { Schema, type Document, type Model } from "mongoose";
import type { BillingInterval } from "./billing-plan";

export type SubscriptionStatus = "active" | "trialing" | "past_due" | "canceled";

export interface SubscriptionDocument extends Document {
  userId: string;
  planCode: string;
  status: SubscriptionStatus;
  interval: BillingInterval;
  seats: number;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<SubscriptionDocument>(
  {
    userId: { type: String, required: true, index: true },
    planCode: { type: String, required: true, index: true },
    status: { type: String, required: true },
    interval: { type: String, required: true },
    seats: { type: Number, required: true, min: 1 },
    currentPeriodStart: { type: Date, required: true },
    currentPeriodEnd: { type: Date, required: true },
    cancelAtPeriodEnd: { type: Boolean, default: false },
  },
  { timestamps: true }
);

subscriptionSchema.index({ userId: 1, status: 1 });

const SubscriptionModel: Model<SubscriptionDocument> =
  mongoose.models.Subscription || mongoose.model<SubscriptionDocument>("Subscription", subscriptionSchema);

export { SubscriptionModel };
