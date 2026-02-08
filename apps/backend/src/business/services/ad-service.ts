import { AdPreferenceModel } from "../models/ad-preference";
import { AppError } from "../../middleware/error-handler";

export interface AdPreferenceInput {
  userId: string;
  adsEnabled: boolean;
  adProfile: string;
}

export const getAdPreference = async (userId: string) => {
  const preference = await AdPreferenceModel.findOne({ userId }).lean();
  if (!preference) {
    throw new AppError("Ad preference not found", 404);
  }
  return preference;
};

export const upsertAdPreference = async (input: AdPreferenceInput) => {
  const preference = await AdPreferenceModel.findOneAndUpdate(
    { userId: input.userId },
    {
      $set: {
        adsEnabled: input.adsEnabled,
        adProfile: input.adProfile,
      },
    },
    { new: true, upsert: true }
  ).lean();

  if (!preference) {
    throw new AppError("Unable to update ad preferences", 500);
  }

  return preference;
};
