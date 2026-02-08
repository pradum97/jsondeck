import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler";
import { ensureBoolean, ensureString } from "../validation";
import { AppError } from "../../middleware/error-handler";
import { getAdPreference, upsertAdPreference } from "../services/ad-service";

const getSubject = (req: Request): string => {
  const subject = req.auth?.subject;
  if (!subject) {
    throw new AppError("Missing authenticated subject", 401);
  }
  return subject;
};

export const getAdPreferenceHandler = asyncHandler(async (req: Request, res: Response) => {
  const preference = await getAdPreference(getSubject(req));
  res.status(200).json({ preference });
});

export const upsertAdPreferenceHandler = asyncHandler(async (req: Request, res: Response) => {
  const preference = await upsertAdPreference({
    userId: getSubject(req),
    adsEnabled: ensureBoolean(req.body?.adsEnabled, "adsEnabled"),
    adProfile: ensureString(req.body?.adProfile, "adProfile"),
  });

  res.status(200).json({ preference });
});
