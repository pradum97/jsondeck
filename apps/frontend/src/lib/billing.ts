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

export const createBillingCheckout = async (
  payload: BillingCheckoutRequest
): Promise<BillingCheckoutResponse> => {
  const response = await api.post<BillingCheckoutResponse>("/billing/checkout", payload);
  return response.data;
};
