import axios from "axios";
import { NextResponse } from "next/server";
import { serverEnv } from "@/lib/server-env";

export const runtime = "nodejs";

export const POST = async (request: Request): Promise<NextResponse> => {
  const signature = request.headers.get("x-razorpay-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const payload = await request.text();
  const response = await axios.post(
    `${serverEnv.backendBaseUrl}/billing/webhook`,
    payload,
    {
      headers: {
        "Content-Type": request.headers.get("content-type") ?? "application/json",
        "x-razorpay-signature": signature,
      },
      validateStatus: () => true,
      responseType: "text",
    }
  );

  return new NextResponse(response.data, {
    status: response.status,
    headers: {
      "Content-Type": response.headers["content-type"] ?? "application/json",
    },
  });
};
