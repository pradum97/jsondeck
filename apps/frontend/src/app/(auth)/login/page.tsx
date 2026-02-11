"use client";

import axios from "axios";
import { signIn } from "next-auth/react";
import { useState, useTransition, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";

export default function LoginPage() {
  const callbackUrl = "/dashboard";
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const sendOtpMutation = useMutation({
    mutationFn: async (value: string) => {
      const response = await axios.post(
        "/api/auth/otp/request",
        { email: value },
        { validateStatus: () => true }
      );
      if (response.status >= 400) {
        throw new Error("Unable to send OTP.");
      }
      return response.data as { ok?: boolean };
    },
  });

  const handleSendOtp = async () => {
    setMessage(null);
    if (!email) {
      setMessage("Enter your email to receive a one-time passcode.");
      return;
    }
    try {
      await sendOtpMutation.mutateAsync(email);
      setMessage("OTP sent. Check your inbox for the 6-digit code.");
    } catch {
      setMessage("Unable to send OTP. Please try again.");
    }
  };

  const handleOtpSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await signIn("email-otp", {
        email,
        otp,
        redirect: false,
        callbackUrl,
      });
      if (result?.error) {
        setMessage("Invalid OTP. Please try again.");
        return;
      }
      if (result?.url) {
        window.location.href = result.url;
      }
    });
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl })}
          className="inline-flex items-center justify-center gap-2 rounded border border-neutral-300 px-4 py-2 text-sm font-semibold"
        >
          <span aria-hidden="true" className="inline-flex h-4 w-4 items-center justify-center">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21.8 12.2c0-.8-.1-1.6-.2-2.3H12v4.3h5.5c-.2 1.4-1 2.6-2.1 3.4v2.8h3.4c2-1.8 3-4.6 3-8.2Z" fill="#4285F4" />
              <path d="M12 22c2.7 0 5-.9 6.7-2.5l-3.4-2.8c-.9.6-2 .9-3.3.9-2.5 0-4.7-1.7-5.5-4H3v2.9A10 10 0 0 0 12 22Z" fill="#34A853" />
              <path d="M6.5 13.6a6.2 6.2 0 0 1 0-3.2V7.5H3a10 10 0 0 0 0 9l3.5-2.9Z" fill="#FBBC05" />
              <path d="M12 6.4c1.5 0 2.8.5 3.9 1.5l2.9-2.9A10 10 0 0 0 3 7.5l3.5 2.9c.8-2.3 3-4 5.5-4Z" fill="#EA4335" />
            </svg>
          </span>
          Continue with Google
        </button>
        <button
          type="button"
          onClick={() => signIn("github", { callbackUrl })}
          className="rounded border border-neutral-300 px-4 py-2 text-sm font-semibold"
        >
          Continue with GitHub
        </button>
      </div>
      <div className="flex items-center gap-3 text-xs uppercase text-neutral-400">
        <span className="h-px flex-1 bg-neutral-200" />
        <span>Email OTP</span>
        <span className="h-px flex-1 bg-neutral-200" />
      </div>
      <form onSubmit={handleOtpSignIn} className="flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="rounded border border-neutral-300 px-3 py-2"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">One-time passcode</span>
          <input
            name="otp"
            type="text"
            required
            inputMode="numeric"
            autoComplete="one-time-code"
            className="rounded border border-neutral-300 px-3 py-2"
            value={otp}
            onChange={(event) => setOtp(event.target.value)}
          />
        </label>
        <button
          type="button"
          onClick={handleSendOtp}
          className="rounded border border-neutral-300 px-4 py-2 text-sm font-semibold"
        >
          Send OTP
        </button>
        <button
          type="submit"
          className="rounded bg-neutral-900 px-4 py-2 text-sm font-semibold text-white"
          disabled={isPending}
        >
          {isPending ? "Signing in..." : "Sign in with OTP"}
        </button>
      </form>
      {message ? <p className="text-sm text-neutral-600">{message}</p> : null}
    </main>
  );
}
