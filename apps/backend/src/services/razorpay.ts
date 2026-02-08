import Razorpay from "razorpay";
import { AppError } from "../middleware/error-handler";

const resolveEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new AppError(`Missing required environment variable: ${key}`, 500);
  }
  return value;
};

let razorpayClient: Razorpay | null = null;

export const getRazorpayClient = (): Razorpay => {
  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: resolveEnv("RAZORPAY_KEY_ID"),
      key_secret: resolveEnv("RAZORPAY_KEY_SECRET"),
    });
  }
  return razorpayClient;
};

export const getRazorpayKeyId = (): string => resolveEnv("RAZORPAY_KEY_ID");

export const getRazorpayWebhookSecret = (): string => resolveEnv("RAZORPAY_WEBHOOK_SECRET");
