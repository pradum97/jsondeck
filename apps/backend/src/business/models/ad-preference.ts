import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface AdPreferenceDocument extends Document {
  userId: string;
  adsEnabled: boolean;
  adProfile: string;
  updatedAt: Date;
  createdAt: Date;
}

const adPreferenceSchema = new Schema<AdPreferenceDocument>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    adsEnabled: { type: Boolean, default: true },
    adProfile: { type: String, required: true, trim: true, maxlength: 80 },
  },
  { timestamps: true }
);

const AdPreferenceModel: Model<AdPreferenceDocument> =
  mongoose.models.AdPreference || mongoose.model<AdPreferenceDocument>("AdPreference", adPreferenceSchema);

export { AdPreferenceModel };
