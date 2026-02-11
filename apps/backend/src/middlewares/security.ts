import { randomBytes, timingSafeEqual } from "crypto";
import type { NextFunction, Request, Response } from "express";

const CSRF_COOKIE_NAME = "csrf_token";
const CSRF_HEADER_NAME = "x-csrf-token";
const STATE_CHANGING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const MAX_JSON_DEPTH = 40;

const removeDangerousKeys = (value: unknown, depth = 0): unknown => {
  if (depth > MAX_JSON_DEPTH) {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => removeDangerousKeys(item, depth + 1))
      .filter((item) => item !== undefined);
  }

  if (value && typeof value === "object") {
    const cleaned: Record<string, unknown> = {};

    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      if (key === "__proto__" || key === "constructor" || key === "prototype") {
        continue;
      }

      const sanitized = removeDangerousKeys(nested, depth + 1);
      if (sanitized !== undefined) {
        cleaned[key] = sanitized;
      }
    }

    return cleaned;
  }

  return value;
};

export const jsonSanitizer = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body && typeof req.body === "object") {
    req.body = removeDangerousKeys(req.body) as Request["body"];
  }

  next();
};

export const payloadSizeGuard = (req: Request, res: Response, next: NextFunction): void => {
  const contentLengthHeader = req.headers["content-length"];
  if (!contentLengthHeader) {
    next();
    return;
  }

  const contentLength = Number(contentLengthHeader);
  const maxPayloadBytes = 2 * 1024 * 1024;

  if (Number.isFinite(contentLength) && contentLength > maxPayloadBytes) {
    res.status(413).json({ message: "Payload too large" });
    return;
  }

  next();
};

const ensureCsrfCookie = (req: Request, res: Response): string => {
  const existing = req.cookies?.[CSRF_COOKIE_NAME];
  if (typeof existing === "string" && existing.length >= 32) {
    return existing;
  }

  const token = randomBytes(32).toString("hex");
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    sameSite: "lax",
    secure: true,
    path: "/",
  });

  return token;
};

const safeEqual = (left: string, right: string): boolean => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
};

export const csrfProtection = (req: Request, res: Response, next: NextFunction): void => {
  const csrfCookie = ensureCsrfCookie(req, res);

  if (!STATE_CHANGING_METHODS.has(req.method)) {
    next();
    return;
  }

  const hasSessionCookie = Boolean(req.cookies?.refresh_token);
  if (!hasSessionCookie) {
    next();
    return;
  }

  const tokenFromHeader = req.header(CSRF_HEADER_NAME);
  if (!tokenFromHeader || !safeEqual(tokenFromHeader, csrfCookie)) {
    res.status(403).json({ message: "Invalid CSRF token" });
    return;
  }

  next();
};
