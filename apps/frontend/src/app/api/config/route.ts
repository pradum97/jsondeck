import axios from "axios";
import type { Session } from "next-auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { createBackendToken } from "@/lib/backend-auth";
import { serverEnv } from "@/lib/server-env";

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

const fetchSubscription = async (session: Session | null) => {
  if (!session?.user?.id) {
    return null;
  }
  const baseUrl = serverEnv.backendBaseUrl;

  const token = await createBackendToken({
    subject: session.user.id,
    email: session.user.email ?? undefined,
    roles: session.user.role ? [session.user.role] : [],
  });

  try {
    const response = await axios.get<{ subscription?: { status?: string; currentPeriodEnd?: string; seats?: number } }>(
      `${baseUrl}/billing/subscriptions/current`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.subscription ?? null;
  } catch (error) {
    return null;
  }
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
