import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { authOptions } from "@/lib/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2023-10-16",
});

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
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 });
  }

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

  const planCode = body.planCode?.trim();
  if (!planCode) {
    return NextResponse.json({ error: "Missing planCode" }, { status: 400 });
  }

  const interval = body.interval === "year" ? "year" : "month";
  const seats = toPositiveInt(body.seats, 1);

  const lookupKey = `${planCode}-${interval}`;
  const prices = await stripe.prices.list({ lookup_keys: [lookupKey], active: true, limit: 1 });
  const price = prices.data[0];
  if (!price) {
    return NextResponse.json({ error: "Plan price not found" }, { status: 404 });
  }

  const successUrl = body.successUrl ?? process.env.STRIPE_SUCCESS_URL;
  const cancelUrl = body.cancelUrl ?? process.env.STRIPE_CANCEL_URL;
  if (!successUrl || !cancelUrl) {
    return NextResponse.json({ error: "Missing redirect URLs" }, { status: 400 });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: price.id, quantity: seats }],
    customer_email: session.user.email ?? undefined,
    success_url: successUrl,
    cancel_url: cancelUrl,
    subscription_data: {
      metadata: {
        planCode,
        interval,
        seats: String(seats),
        userId: session.user.id,
      },
    },
    metadata: {
      planCode,
      interval,
      seats: String(seats),
      userId: session.user.id,
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
};
