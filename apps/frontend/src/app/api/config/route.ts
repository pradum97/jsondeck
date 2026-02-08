import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { createBackendToken } from "@/lib/backend-auth";

const resolveRole = (subscription: {
  status?: string;
  currentPeriodEnd?: string;
  seats?: number;
} | null): "free" | "pro" | "team" => {
  if (!subscription) {
    return "free";
  }
  const status = subscription.status ?? "";
  const active = ["active", "trialing", "past_due"].includes(status);
  const endDate = subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) : null;
  if (!active || !endDate || endDate.getTime() <= Date.now()) {
    return "free";
  }
  if ((subscription.seats ?? 1) > 1) {
    return "team";
  }
  return "pro";
};

const fetchSubscription = async (session: Awaited<ReturnType<typeof getServerSession>>) => {
  if (!session?.user?.id) {
    return null;
  }
  const baseUrl = process.env.BACKEND_BASE_URL;
  if (!baseUrl) {
    return null;
  }

  const token = await createBackendToken({
    subject: session.user.id,
    email: session.user.email ?? undefined,
    roles: session.user.role ? [session.user.role] : [],
  });

  const response = await fetch(`${baseUrl}/billing/subscriptions/current`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as { subscription?: { status?: string; currentPeriodEnd?: string; seats?: number } };
  return data.subscription ?? null;
};

export const runtime = "nodejs";

export const GET = async (): Promise<NextResponse> => {
  const session = await getServerSession(authOptions);
  const subscription = await fetchSubscription(session);
  const role = resolveRole(subscription);

  return NextResponse.json({
    role,
    adsEnabled: role === "free",
  });
};
