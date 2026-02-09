import { createHmac, randomInt, timingSafeEqual } from "crypto";
import { AppError } from "../../middleware/error-handler";
import { sendOtpEmail } from "../../services/email";
import { OtpModel } from "../models/otp";

const OTP_TTL_MS = 5 * 60 * 1000;
const OTP_LENGTH = 6;

const resolveSecret = (): string => {
  const secret = process.env.OTP_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError("Missing OTP_SECRET or JWT_SECRET", 500);
  }
  return secret;
};

const hashOtp = (email: string, otp: string): string => {
  return createHmac("sha256", resolveSecret())
    .update(`${email}:${otp}`)
    .digest("hex");
};

const generateOtp = (): string => {
  return randomInt(0, 10 ** OTP_LENGTH).toString().padStart(OTP_LENGTH, "0");
};

export const requestOtpForEmail = async (email: string): Promise<{ expiresAt: Date }> => {
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await OtpModel.deleteMany({ email });
  await OtpModel.create({
    email,
    otpHash: hashOtp(email, otp),
    expiresAt,
  });

  await sendOtpEmail({ to: email, otp, expiresInMinutes: OTP_TTL_MS / 60000 });

  return { expiresAt };
};

export const verifyOtpForEmail = async (email: string, otp: string): Promise<void> => {
  const record = await OtpModel.findOne({ email }).sort({ createdAt: -1 }).exec();
  if (!record) {
    throw new AppError("OTP not found", 404);
  }

  if (record.expiresAt.getTime() <= Date.now()) {
    await OtpModel.deleteMany({ email });
    throw new AppError("OTP expired", 401);
  }

  const expected = Buffer.from(record.otpHash, "hex");
  const actual = Buffer.from(hashOtp(email, otp), "hex");

  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    throw new AppError("Invalid OTP", 401);
  }

  await OtpModel.deleteMany({ email });
};
