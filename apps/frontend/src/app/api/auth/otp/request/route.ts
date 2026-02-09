import axios from "axios";
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

  const response = await axios.post(
    `${backendBaseUrl}/auth/otp/request`,
    { email },
    {
      headers: { "Content-Type": "application/json" },
      validateStatus: () => true,
    }
  );

  if (response.status >= 400) {
    const errorBody = response.data as { error?: string } | undefined;
    return NextResponse.json({ error: errorBody?.error ?? "Unable to send OTP" }, { status: response.status });
  }

  const data = response.data as { expiresAt?: string };
  return NextResponse.json({ ok: true, expiresAt: data.expiresAt });
};
