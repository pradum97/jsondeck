import mongoose, { Schema, type Document, type Model } from "mongoose";

export type BillingInterval = "month" | "year";

export interface BillingPlanDocument extends Document {
  planCode: string;
  name: string;
  description?: string;
  priceMonthlyCents: number;
  priceYearlyCents: number;
  features: string[];
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const billingPlanSchema = new Schema<BillingPlanDocument>(
  {
    planCode: { type: String, required: true, unique: true, trim: true, maxlength: 60 },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 240 },
    priceMonthlyCents: { type: Number, required: true, min: 0 },
    priceYearlyCents: { type: Number, required: true, min: 0 },
    features: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    createdBy: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

billingPlanSchema.index({ planCode: 1, isActive: 1 });

const BillingPlanModel: Model<BillingPlanDocument> =
  mongoose.models.BillingPlan || mongoose.model<BillingPlanDocument>("BillingPlan", billingPlanSchema);

export { BillingPlanModel };
