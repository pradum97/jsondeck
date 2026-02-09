import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface OtpDocument extends Document {
  email: string;
  otpHash: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const otpSchema = new Schema<OtpDocument>(
  {
    email: { type: String, required: true, index: true, trim: true, maxlength: 200 },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

otpSchema.index({ email: 1, createdAt: -1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OtpModel: Model<OtpDocument> =
  mongoose.models.Otp || mongoose.model<OtpDocument>("Otp", otpSchema);

export { OtpModel };
