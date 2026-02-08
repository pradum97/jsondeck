import { randomUUID } from "crypto";
import type { Request } from "express";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "../middleware/error-handler";
import { asyncHandler } from "../utils/async-handler";
import { getActiveRefreshToken, rotateRefreshToken } from "../business/services/refresh-token-service";

const REFRESH_COOKIE_NAME = "refresh_token";
const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

interface RefreshTokenClaims extends jwt.JwtPayload {
  sub?: string;
  tokenType?: string;
  jti?: string;
}

const getCookie = (req: Request, name: string): string | null => {
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

const signAccessToken = (subject: string): string => {
  return jwt.sign(
    { sub: subject },
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

export const authRouter = Router();

authRouter.post(
  "/auth/refresh",
  asyncHandler(async (req, res) => {
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

    const accessToken = signAccessToken(payload.sub);

    res.cookie(REFRESH_COOKIE_NAME, newRefreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: REFRESH_TOKEN_TTL_MS,
    });

    res.status(200).json({ accessToken });
  })
);
