import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { createBackendToken } from "@/lib/backend-auth";
import { serverEnv } from "@/lib/server-env";

const toPositiveInt = (value: unknown, fallback: number): number => {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return fallback;
};

export const runtime = "nodejs";

export const POST = async (request: Request): Promise<NextResponse> => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    planCode?: string;
    interval?: "month" | "year";
    seats?: number;
    successUrl?: string;
    cancelUrl?: string;
  };

  const token = await createBackendToken({
    subject: session.user.id,
    email: session.user.email ?? undefined,
    roles: session.user.role ? [session.user.role] : [],
  });

  const planCode = body.planCode?.trim();
  if (!planCode) {
    return NextResponse.json({ error: "Missing planCode" }, { status: 400 });
  }

  const interval = body.interval === "year" ? "year" : "month";
  const seats = toPositiveInt(body.seats, 1);

  const response = await fetch(`${serverEnv.backendBaseUrl}/billing/checkout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      planCode,
      interval,
      seats,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    return NextResponse.json({ error: payload?.error ?? "Checkout failed" }, { status: response.status });
  }

  return NextResponse.json(payload);
};
