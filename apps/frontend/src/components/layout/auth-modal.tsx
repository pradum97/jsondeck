"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import api from "@/lib/api";

type AuthMode = "login" | "signup" | "forgot";

type AuthModalProps = {
  mode: AuthMode | null;
  open: boolean;
  onClose: () => void;
  onSwitchMode: (mode: AuthMode) => void;
  onAuthSuccess: () => void;
};

export function AuthModal({ mode, open, onClose, onSwitchMode, onAuthSuccess }: AuthModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [loginForm, setLoginForm] = useState({ email: "", password: "", remember: true });
  const [signupForm, setSignupForm] = useState({
    fullName: "",
    gender: "prefer_not_to_say",
    dob: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [forgotEmail, setForgotEmail] = useState("");

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await api.post("/api/auth/login", { email: loginForm.email, password: loginForm.password });
      onAuthSuccess();
      onClose();
    } catch {
      setError("Unable to login. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (signupForm.password !== signupForm.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.post("/api/auth/register", signupForm);
      onAuthSuccess();
      onClose();
    } catch {
      setError("Unable to create your account right now.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    try {
      setLoading(true);
      setError(null);
      await api.post("/api/auth/forgot-password", { email: forgotEmail });
      onClose();
    } catch {
      setError("Unable to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && mode ? (
        <motion.div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="w-full max-w-lg rounded-2xl border border-border/80 bg-card/85 p-5 text-foreground shadow-2xl" initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.98 }}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">{mode === "login" ? "Welcome back" : mode === "signup" ? "Create your account" : "Forgot password"}</h2>
              <button type="button" className="rounded-md border border-border px-2 py-1 text-sm text-muted-foreground hover:text-foreground" onClick={onClose}>✕</button>
            </div>

            {error ? <p className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p> : null}

            {mode === "login" ? (
              <div className="space-y-3">
                <input className="h-10 w-full rounded-lg border border-border bg-card px-3" placeholder="Email" type="email" value={loginForm.email} onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))} />
                <input className="h-10 w-full rounded-lg border border-border bg-card px-3" placeholder="Password" type="password" value={loginForm.password} onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))} />
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-muted-foreground"><input type="checkbox" checked={loginForm.remember} onChange={(event) => setLoginForm((prev) => ({ ...prev, remember: event.target.checked }))} /> Remember me</label>
                  <button type="button" onClick={() => onSwitchMode("forgot")} className="text-accent hover:underline">Forgot password?</button>
                </div>
                <button type="button" onClick={() => void handleLogin()} disabled={loading} className="h-10 w-full rounded-lg bg-accent px-4 font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60">Login</button>
                <button type="button" className="h-10 w-full rounded-lg border border-border bg-background px-4 font-semibold text-foreground">Continue with Google</button>
              </div>
            ) : null}

            {mode === "signup" ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input className="h-10 rounded-lg border border-border bg-card px-3 sm:col-span-2" placeholder="Full Name" value={signupForm.fullName} onChange={(event) => setSignupForm((prev) => ({ ...prev, fullName: event.target.value }))} />
                <select className="h-10 rounded-lg border border-border bg-card px-3" value={signupForm.gender} onChange={(event) => setSignupForm((prev) => ({ ...prev, gender: event.target.value }))}>
                  <option value="prefer_not_to_say">Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <input className="h-10 rounded-lg border border-border bg-card px-3" type="date" value={signupForm.dob} onChange={(event) => setSignupForm((prev) => ({ ...prev, dob: event.target.value }))} />
                <input className="h-10 rounded-lg border border-border bg-card px-3" placeholder="Username" value={signupForm.username} onChange={(event) => setSignupForm((prev) => ({ ...prev, username: event.target.value }))} />
                <input className="h-10 rounded-lg border border-border bg-card px-3" placeholder="Phone" value={signupForm.phone} onChange={(event) => setSignupForm((prev) => ({ ...prev, phone: event.target.value }))} />
                <input className="h-10 rounded-lg border border-border bg-card px-3 sm:col-span-2" placeholder="Email" type="email" value={signupForm.email} onChange={(event) => setSignupForm((prev) => ({ ...prev, email: event.target.value }))} />
                <input className="h-10 rounded-lg border border-border bg-card px-3" placeholder="Password" type="password" value={signupForm.password} onChange={(event) => setSignupForm((prev) => ({ ...prev, password: event.target.value }))} />
                <input className="h-10 rounded-lg border border-border bg-card px-3" placeholder="Confirm Password" type="password" value={signupForm.confirmPassword} onChange={(event) => setSignupForm((prev) => ({ ...prev, confirmPassword: event.target.value }))} />
                <button type="button" onClick={() => void handleSignup()} disabled={loading} className="h-10 rounded-lg bg-accent px-4 font-semibold text-accent-foreground hover:opacity-90 sm:col-span-2 disabled:opacity-60">Sign up</button>
                <button type="button" className="h-10 rounded-lg border border-border bg-background px-4 font-semibold text-foreground sm:col-span-2">Continue with Google</button>
              </div>
            ) : null}

            {mode === "forgot" ? (
              <div className="space-y-3">
                <input className="h-10 w-full rounded-lg border border-border bg-card px-3" placeholder="Email" type="email" value={forgotEmail} onChange={(event) => setForgotEmail(event.target.value)} />
                <button type="button" onClick={() => void handleForgot()} disabled={loading} className="h-10 w-full rounded-lg bg-accent px-4 font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60">Send reset link</button>
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
