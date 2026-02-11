import type { NextFunction, Request, Response } from "express";
import { AppError } from "./error-handler";

const ADMIN_ROLES = new Set(["admin", "superadmin"]);

export const requireAdminRole = (req: Request, _res: Response, next: NextFunction): void => {
  const roles = req.auth?.roles ?? [];
  const hasAdminAccess = roles.some((role) => ADMIN_ROLES.has(role));

  if (!hasAdminAccess) {
    next(new AppError("Admin access required", 403));
    return;
  }

  next();
};
