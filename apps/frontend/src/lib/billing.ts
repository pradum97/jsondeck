import api from "./api";

export type BillingPlanCode = "free" | "pro" | "team";
export type BillingInterval = "month" | "year";

export interface BillingCheckoutRequest {
  planCode: BillingPlanCode;
  interval: BillingInterval;
  seats?: number;
}

export interface BillingCheckoutResponse {
  orderId: string;
  amount: number;
  currency: string;
  razorpayKeyId: string;
  planCode: BillingPlanCode;
  interval: BillingInterval;
  seats: number;
}

export interface BillingVerifyRequest {
  orderId: string;
  paymentId: string;
  signature: string;
  planCode?: BillingPlanCode;
  interval?: BillingInterval;
  seats?: number;
}

export interface BillingVerifyResponse {
  verified: boolean;
}

export const createBillingCheckout = async (
  payload: BillingCheckoutRequest
): Promise<BillingCheckoutResponse> => {
  const response = await api.post<BillingCheckoutResponse>("/billing/checkout", payload);
  return response.data;
};

export const verifyBillingPayment = async (
  payload: BillingVerifyRequest
): Promise<BillingVerifyResponse> => {
  const response = await api.post<BillingVerifyResponse>("/billing/verify", payload);
  return response.data;
};
