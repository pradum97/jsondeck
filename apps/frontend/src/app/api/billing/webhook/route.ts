import axios from "axios";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createBackendToken } from "@/lib/backend-auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2023-10-16",
});

const toISOString = (value: number | null | undefined): string | null => {
  if (!value) {
    return null;
  }
  return new Date(value * 1000).toISOString();
};

const syncSubscription = async (subscription: Stripe.Subscription): Promise<void> => {
  const baseUrl = process.env.BACKEND_BASE_URL;
  if (!baseUrl) {
    throw new Error("Missing BACKEND_BASE_URL");
  }

  const userId = subscription.metadata?.userId;
  if (!userId) {
    return;
  }

  const token = await createBackendToken({
    subject: userId,
    email: subscription.metadata?.email,
    roles: [],
  });

  const interval = subscription.metadata?.interval ?? subscription.items.data[0]?.price.recurring?.interval;
  const planCode = subscription.metadata?.planCode ?? subscription.items.data[0]?.price.lookup_key;
  const seats = Number.parseInt(subscription.metadata?.seats ?? "1", 10);
  const currentPeriodStart = toISOString(subscription.current_period_start);
  const currentPeriodEnd = toISOString(subscription.current_period_end);

  if (!planCode || !interval || !currentPeriodStart || !currentPeriodEnd) {
    return;
  }

  await axios.post(
    `${baseUrl}/billing/subscriptions`,
    {
      planCode,
      interval,
      seats: Number.isFinite(seats) && seats > 0 ? seats : 1,
      status: subscription.status,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const runtime = "nodejs";

export const POST = async (request: Request): Promise<NextResponse> => {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type.startsWith("customer.subscription")) {
    const subscription = event.data.object as Stripe.Subscription;
    await syncSubscription(subscription);
  }

  return NextResponse.json({ received: true });
};
