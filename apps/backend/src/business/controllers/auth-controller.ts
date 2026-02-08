import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler";
import { ensureOptionalString, ensureString, ensureStringArray } from "../validation";
import { AppError } from "../../middleware/error-handler";
import { connectAuthProvider, getAccountProfile, upsertAccountProfile } from "../services/auth-service";

const getSubject = (req: Request): string => {
  const subject = req.auth?.subject;
  if (!subject) {
    throw new AppError("Missing authenticated subject", 401);
  }
  return subject;
};

export const getProfileHandler = asyncHandler(async (req: Request, res: Response) => {
  const account = await getAccountProfile(getSubject(req));
  res.status(200).json({ account });
});

export const upsertProfileHandler = asyncHandler(async (req: Request, res: Response) => {
  const account = await upsertAccountProfile({
    userId: getSubject(req),
    email: ensureOptionalString(req.body?.email),
    displayName: ensureOptionalString(req.body?.displayName),
    roles: req.body?.roles ? ensureStringArray(req.body.roles, "roles") : undefined,
  });
  res.status(200).json({ account });
});

export const connectProviderHandler = asyncHandler(async (req: Request, res: Response) => {
  const account = await connectAuthProvider(getSubject(req), {
    provider: ensureString(req.body?.provider, "provider"),
    providerId: ensureString(req.body?.providerId, "providerId"),
    connectedAt: new Date(),
  });
  res.status(200).json({ account });
});
