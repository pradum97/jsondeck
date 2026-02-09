import nodemailer from "nodemailer";
import { AppError } from "../middleware/error-handler";

const resolveEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new AppError(`Missing required environment variable: ${key}`, 500);
  }
  return value;
};

const resolvePort = (value: string): number => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new AppError("EMAIL_SERVER_PORT must be a positive integer", 500);
  }
  return parsed;
};

let transporter: nodemailer.Transporter | null = null;

const getTransporter = (): nodemailer.Transporter => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: resolveEnv("EMAIL_SERVER_HOST"),
      port: resolvePort(resolveEnv("EMAIL_SERVER_PORT")),
      secure: process.env.EMAIL_SERVER_SECURE === "true",
      auth: {
        user: resolveEnv("EMAIL_SERVER_USER"),
        pass: resolveEnv("EMAIL_SERVER_PASSWORD"),
      },
    });
  }
  return transporter;
};

export const sendOtpEmail = async ({
  to,
  otp,
  expiresInMinutes,
}: {
  to: string;
  otp: string;
  expiresInMinutes: number;
}): Promise<void> => {
  const from = resolveEnv("EMAIL_FROM");
  await getTransporter().sendMail({
    from,
    to,
    subject: "Your JSONDeck login code",
    text: `Your JSONDeck one-time passcode is ${otp}. It expires in ${expiresInMinutes} minutes.`,
    html: `<p>Your JSONDeck one-time passcode is <strong>${otp}</strong>. It expires in ${expiresInMinutes} minutes.</p>`,
  });
};
