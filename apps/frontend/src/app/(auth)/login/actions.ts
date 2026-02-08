"use server";

import { cookies } from "next/headers";

const ACCESS_COOKIE_NAME = "access_token";
const REFRESH_COOKIE_NAME = "refresh_token";

const baseUrl =
  process.env.BACKEND_URL ||
  process.env.NEXT_PRIVATE_BACKEND_URL ||
  "http://localhost:4000";

type LoginResult = {
  ok: boolean;
  accessToken?: string;
  error?: string;
};

type LoginResponse = {
  accessToken: string;
  refreshToken?: string;
};

export async function loginAction(formData: FormData): Promise<LoginResult> {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password }),
    cache: "no-store"
  });

  if (!response.ok) {
    return { ok: false, error: "Invalid credentials" };
  }

  const data = (await response.json()) as LoginResponse;

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
  }

  return { ok: true, accessToken: data.accessToken };
}

export async function logoutAction(): Promise<void> {
  await fetch(`${baseUrl}/api/auth/logout`, {
    method: "POST",
    cache: "no-store"
  });

  cookies().delete(ACCESS_COOKIE_NAME);
  cookies().delete(REFRESH_COOKIE_NAME);
}
