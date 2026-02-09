import { NextResponse } from "next/server";
import { serverEnv } from "@/lib/server-env";

export const runtime = "nodejs";

export const POST = async (request: Request): Promise<NextResponse> => {
  const signature = request.headers.get("x-razorpay-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const payload = await request.text();
  const response = await fetch(`${serverEnv.backendBaseUrl}/billing/webhook`, {
    method: "POST",
    headers: {
      "Content-Type": request.headers.get("content-type") ?? "application/json",
      "x-razorpay-signature": signature,
    },
    body: payload,
  });

  const body = await response.text();
  return new NextResponse(body, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "application/json",
    },
  });
};
