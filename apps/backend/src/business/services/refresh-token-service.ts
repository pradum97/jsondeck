import { AppError } from "../../middleware/error-handler";
import { RefreshTokenModel, type RefreshTokenDocument } from "../models/refresh-token";

export const getActiveRefreshToken = async (token: string): Promise<RefreshTokenDocument> => {
  const existing = await RefreshTokenModel.findOne({ token }).exec();
  if (!existing) {
    throw new AppError("Refresh token not recognized", 401);
  }

  if (existing.revokedAt) {
    throw new AppError("Refresh token revoked", 401);
  }

  if (existing.expiresAt.getTime() <= Date.now()) {
    throw new AppError("Refresh token expired", 401);
  }

  return existing;
};

export const storeRefreshToken = async (
  userId: string,
  token: string,
  expiresAt: Date
): Promise<RefreshTokenDocument> => {
  const refreshToken = new RefreshTokenModel({ userId, token, expiresAt });
  return refreshToken.save();
};

export const rotateRefreshToken = async (
  existing: RefreshTokenDocument,
  newToken: string,
  newExpiresAt: Date
): Promise<void> => {
  existing.revokedAt = new Date();
  existing.replacedByToken = newToken;
  await existing.save();
  await storeRefreshToken(existing.userId, newToken, newExpiresAt);
};

export const revokeRefreshToken = async (token: string): Promise<void> => {
  const existing = await RefreshTokenModel.findOne({ token }).exec();
  if (!existing) {
    return;
  }
  existing.revokedAt = new Date();
  await existing.save();
};
