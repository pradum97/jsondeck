import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler";
import { ensureBoolean, ensureOptionalString } from "../validation";
import { createConfig, deleteConfig, getConfig, updateConfig } from "../services/config-service";

export const getConfigHandler = asyncHandler(async (req: Request, res: Response) => {
  const config = await getConfig(req.auth?.subject ?? "");
  res.status(200).json({ config });
});

export const createConfigHandler = asyncHandler(async (req: Request, res: Response) => {
  const adsEnabled = req.body?.adsEnabled !== undefined ? ensureBoolean(req.body.adsEnabled, "adsEnabled") : undefined;
  const adProfile = ensureOptionalString(req.body?.adProfile);
  const config = await createConfig(req.auth?.subject ?? "", { adsEnabled, adProfile });
  res.status(201).json({ config });
});

export const updateConfigHandler = asyncHandler(async (req: Request, res: Response) => {
  const adsEnabled = req.body?.adsEnabled !== undefined ? ensureBoolean(req.body.adsEnabled, "adsEnabled") : undefined;
  const adProfile = ensureOptionalString(req.body?.adProfile);
  const config = await updateConfig(req.auth?.subject ?? "", { adsEnabled, adProfile });
  res.status(200).json({ config });
});

export const deleteConfigHandler = asyncHandler(async (req: Request, res: Response) => {
  await deleteConfig(req.auth?.subject ?? "");
  res.status(204).send();
});
