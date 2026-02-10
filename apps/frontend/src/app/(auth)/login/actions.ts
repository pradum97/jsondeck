"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { serverEnv } from "@/lib/server-env";

const ACCESS_COOKIE_NAME = "access_token";
const REFRESH_COOKIE_NAME = "refresh_token";

const baseUrl = serverEnv.backendBaseUrl;

type LoginResult = {
  ok: boolean;
  accessToken?: string;
  error?: string;
};

type LoginResponse = {
  accessToken: string;
  refreshToken?: string;
};

const getCookieValue = (setCookieHeader: string[], name: string): string | null => {
  const target = setCookieHeader.find((header) => header.startsWith(`${name}=`));
  if (!target) {
    return null;
  }
  const [cookiePair = ""] = target.split(";");
  const [, value] = cookiePair.split("=");
  return value ?? null;
};

export async function loginAction(formData: FormData): Promise<LoginResult> {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  try {
    const response = await axios.post<LoginResponse>(`${baseUrl}/auth/login`, { email, password });
    const data = response.data;
    const setCookieHeaderValue = response.headers["set-cookie"] ?? [];
    const setCookieHeader = Array.isArray(setCookieHeaderValue) ? setCookieHeaderValue : [setCookieHeaderValue];
    const refreshTokenFromCookie = getCookieValue(setCookieHeader, REFRESH_COOKIE_NAME);

    cookies().set(ACCESS_COOKIE_NAME, data.accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 15
    });

    if (data.refreshToken) {
      cookies().set(REFRESH_COOKIE_NAME, data.refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 7
      });
    } else if (refreshTokenFromCookie) {
      cookies().set(REFRESH_COOKIE_NAME, refreshTokenFromCookie, {
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 7
      });
    }

    return { ok: true, accessToken: data.accessToken };
  } catch (error) {
    return { ok: false, error: "Invalid credentials" };
  }
}

export async function logoutAction(): Promise<void> {
  await axios.post(`${baseUrl}/auth/logout`);

  cookies().delete(ACCESS_COOKIE_NAME);
  cookies().delete(REFRESH_COOKIE_NAME);
}
