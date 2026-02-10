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
          className="rounded border border-neutral-300 px-4 py-2 text-sm font-semibold"
        >
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
