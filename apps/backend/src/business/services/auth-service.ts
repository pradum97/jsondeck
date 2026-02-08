import { AccountModel, type ConnectedProvider } from "../models/account";
import { AppError } from "../../middleware/error-handler";

export interface AccountProfileInput {
  userId: string;
  email?: string;
  displayName?: string;
  roles?: string[];
}

export const getAccountProfile = async (userId: string) => {
  const account = await AccountModel.findOne({ userId }).lean();
  if (!account) {
    throw new AppError("Account profile not found", 404);
  }
  return account;
};

export const upsertAccountProfile = async (input: AccountProfileInput) => {
  const updated = await AccountModel.findOneAndUpdate(
    { userId: input.userId },
    {
      $set: {
        email: input.email,
        displayName: input.displayName,
        roles: input.roles ?? ["free"],
      },
      $setOnInsert: {
        providers: [],
      },
    },
    { new: true, upsert: true }
  ).lean();

  if (!updated) {
    throw new AppError("Unable to update account profile", 500);
  }

  return updated;
};

export const connectAuthProvider = async (userId: string, provider: ConnectedProvider) => {
  const account = await AccountModel.findOneAndUpdate(
    { userId },
    {
      $setOnInsert: {
        email: undefined,
        displayName: undefined,
        roles: ["free"],
      },
      $addToSet: {
        providers: provider,
      },
    },
    { new: true, upsert: true }
  ).lean();

  if (!account) {
    throw new AppError("Unable to connect provider", 500);
  }

  return account;
};
