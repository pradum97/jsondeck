import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "./error-handler";

export interface AuthContext {
  subject: string;
  email?: string;
  roles: string[];
}

interface JwtClaims extends jwt.JwtPayload {
  sub?: string;
  email?: string;
  roles?: string[];
}

const getBearerToken = (req: Request): string | null => {
  const header = req.headers.authorization;
  if (!header) {
    return null;
  }
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return null;
  }
  return token;
};

export const requireAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const token = getBearerToken(req);
  if (!token) {
    next(new AppError("Missing authorization token", 401));
    return;
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret, {
      issuer: env.jwtIssuer,
      audience: env.jwtAudience,
    }) as JwtClaims;

    if (!payload.sub) {
      next(new AppError("Invalid token payload", 401));
      return;
    }

    req.auth = {
      subject: payload.sub,
      email: payload.email,
      roles: Array.isArray(payload.roles) ? payload.roles : [],
    };

    next();
  } catch (error) {
    next(new AppError("Invalid or expired token", 401));
  }
};
