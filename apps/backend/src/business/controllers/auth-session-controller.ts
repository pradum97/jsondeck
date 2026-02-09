import { randomUUID } from "crypto";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { AppError } from "../../middleware/error-handler";
import { asyncHandler } from "../../utils/async-handler";
import { ensureEmail, ensureString } from "../validation";
import { authenticateUser, getOrCreateUserByEmail, getUserById } from "../services/auth-session-service";
import { getActiveRefreshToken, revokeRefreshToken, rotateRefreshToken, storeRefreshToken } from "../services/refresh-token-service";
import { requestOtpForEmail, verifyOtpForEmail } from "../services/otp-service";
import { connectProviderHandler, getProfileHandler, upsertProfileHandler } from "./auth-controller";

const REFRESH_COOKIE_NAME = "refresh_token";
const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

interface RefreshTokenClaims extends jwt.JwtPayload {
  sub?: string;
  tokenType?: string;
  jti?: string;
}

const getCookie = (req: Request, name: string): string | null => {
  const cookieStore = (req as Request & { cookies?: Record<string, string> }).cookies;
  if (cookieStore?.[name]) {
    return cookieStore[name];
  }

  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());
  for (const cookie of cookies) {
    const [key, ...valueParts] = cookie.split("=");
    if (key === name) {
      return decodeURIComponent(valueParts.join("="));
    }
  }

  return null;
};

const signAccessToken = (subject: string, roles: string[], email?: string): string => {
  return jwt.sign(
    { sub: subject, roles, email },
    env.jwtSecret,
    {
      issuer: env.jwtIssuer,
      audience: env.jwtAudience,
      expiresIn: ACCESS_TOKEN_TTL,
    }
  );
};

const signRefreshToken = (subject: string): string => {
  return jwt.sign(
    { sub: subject, tokenType: "refresh", jti: randomUUID() },
    env.jwtSecret,
    {
      issuer: env.jwtIssuer,
      audience: env.jwtAudience,
      expiresIn: Math.floor(REFRESH_TOKEN_TTL_MS / 1000),
    }
  );
};

export const loginHandler = asyncHandler(async (req: Request, res: Response) => {
  const email = ensureEmail(req.body?.email, "email");
  const password = ensureString(req.body?.password, "password");
  const user = await authenticateUser(email, password);

  const accessToken = signAccessToken(user.userId, user.roles, user.email);
  const refreshToken = signRefreshToken(user.userId);
  const refreshExpiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
  await storeRefreshToken(user.userId, refreshToken, refreshExpiresAt);

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: REFRESH_TOKEN_TTL_MS,
  });

  res.status(200).json({ accessToken });
});

export const logoutHandler = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = getCookie(req, REFRESH_COOKIE_NAME);
  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
  }

  res.cookie(REFRESH_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 0,
  });

  res.status(204).send();
});

export const refreshHandler = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = getCookie(req, REFRESH_COOKIE_NAME);
  if (!refreshToken) {
    throw new AppError("Missing refresh token", 401);
  }

  let payload: RefreshTokenClaims;
  try {
    payload = jwt.verify(refreshToken, env.jwtSecret, {
      issuer: env.jwtIssuer,
      audience: env.jwtAudience,
    }) as RefreshTokenClaims;
  } catch (error) {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  if (!payload.sub || payload.tokenType !== "refresh") {
    throw new AppError("Invalid refresh token", 401);
  }

  const existingToken = await getActiveRefreshToken(refreshToken);
  if (existingToken.userId !== payload.sub) {
    throw new AppError("Invalid refresh token", 401);
  }

  const newRefreshToken = signRefreshToken(payload.sub);
  const refreshExpiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
  await rotateRefreshToken(existingToken, newRefreshToken, refreshExpiresAt);

  const user = await getUserById(payload.sub);
  const accessToken = signAccessToken(payload.sub, user.roles, user.email);

  res.cookie(REFRESH_COOKIE_NAME, newRefreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: REFRESH_TOKEN_TTL_MS,
  });

  res.status(200).json({ accessToken });
});

export const requestOtpHandler = asyncHandler(async (req: Request, res: Response) => {
  const email = ensureEmail(req.body?.email, "email");
  const { expiresAt } = await requestOtpForEmail(email);
  res.status(200).json({ expiresAt });
});

export const verifyOtpHandler = asyncHandler(async (req: Request, res: Response) => {
  const email = ensureEmail(req.body?.email, "email");
  const otp = ensureString(req.body?.otp, "otp").replace(/\s+/g, "");
  if (!/^\d{6}$/.test(otp)) {
    throw new AppError("OTP must be 6 digits", 400);
  }

  await verifyOtpForEmail(email, otp);
  const user = await getOrCreateUserByEmail(email);

  res.status(200).json({
    user: {
      id: user.userId,
      email: user.email,
      roles: user.roles,
    },
  });
});

export { connectProviderHandler, getProfileHandler, upsertProfileHandler };
