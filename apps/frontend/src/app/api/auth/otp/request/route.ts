import { NextResponse } from "next/server";
import { serverEnv } from "@/lib/server-env";

export const runtime = "nodejs";

const backendBaseUrl = serverEnv.backendBaseUrl;

export const POST = async (req: Request): Promise<NextResponse> => {
  const body = (await req.json()) as { email?: string };
  const email = body.email?.trim();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const response = await fetch(`${backendBaseUrl}/auth/otp/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    return NextResponse.json({ error: errorBody.error ?? "Unable to send OTP" }, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json({ ok: true, expiresAt: data.expiresAt });
};
