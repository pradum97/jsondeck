import { AppError } from "../../middleware/error-handler";
import { AccountModel } from "../models/account";
import { AdPreferenceModel, type AdPreferenceDocument } from "../models/ad-preference";

export interface ConfigResult {
  role: string;
  adsEnabled: boolean;
  adProfile: string;
}

export interface ConfigInput {
  adsEnabled?: boolean;
  adProfile?: string;
}

const ensureAccount = async (userId: string) => {
  const account = await AccountModel.findOne({ userId }).exec();
  if (account) {
    return account;
  }

  const created = new AccountModel({ userId, roles: ["free"], providers: [] });
  return created.save();
};

const resolveRole = (role?: string): string => {
  if (role === "pro" || role === "team") {
    return role;
  }
  return "free";
};

export const getConfig = async (userId: string, roleOverride?: string): Promise<ConfigResult> => {
  const account = await ensureAccount(userId);
  let preference = await AdPreferenceModel.findOne({ userId }).exec();
  if (!preference) {
    preference = await AdPreferenceModel.create({
      userId,
      adsEnabled: true,
      adProfile: "default",
    });
  }

  const role = resolveRole(roleOverride ?? account.roles[0]);

  return {
    role,
    adsEnabled: role === "free" ? preference.adsEnabled : false,
    adProfile: preference.adProfile,
  };
};

export const createConfig = async (
  userId: string,
  input: ConfigInput,
  roleOverride?: string
): Promise<AdPreferenceDocument> => {
  const existing = await AdPreferenceModel.findOne({ userId }).exec();
  if (existing) {
    throw new AppError("Config already exists", 409);
  }

  const role = resolveRole(roleOverride);

  const preference = new AdPreferenceModel({
    userId,
    adsEnabled: role === "free" ? input.adsEnabled ?? true : false,
    adProfile: input.adProfile ?? "default",
  });
  return preference.save();
};

export const updateConfig = async (
  userId: string,
  input: ConfigInput,
  roleOverride?: string
): Promise<AdPreferenceDocument> => {
  const preference = await AdPreferenceModel.findOne({ userId }).exec();
  if (!preference) {
    throw new AppError("Config not found", 404);
  }
  const role = resolveRole(roleOverride);
  if (input.adsEnabled !== undefined) {
    preference.adsEnabled = role === "free" ? input.adsEnabled : false;
  }
  if (input.adProfile !== undefined) {
    preference.adProfile = input.adProfile;
  }
  await preference.save();
  return preference;
};

export const deleteConfig = async (userId: string): Promise<void> => {
  await AdPreferenceModel.deleteOne({ userId }).exec();
};
