"use client";

import { useCallback, useState, useTransition } from "react";

import { loginAction, logoutAction } from "@/app/(auth)/login/actions";
import { setAccessToken } from "@/lib/api";

type Credentials = {
  email: string;
  password: string;
};

type LoginResult = {
  ok: boolean;
  error?: string;
};

export const useAuth = () => {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const login = useCallback(async (credentials: Credentials): Promise<LoginResult> => {
    setError(null);

    const formData = new FormData();
    formData.set("email", credentials.email);
    formData.set("password", credentials.password);

    const result = await loginAction(formData);

    if (!result.ok) {
      setError(result.error ?? "Unable to sign in.");
      return { ok: false, error: result.error };
    }

    if (result.accessToken) {
      setAccessToken(result.accessToken);
    }

    return { ok: true };
  }, []);

  const logout = useCallback(async () => {
    startTransition(async () => {
      await logoutAction();
      setAccessToken(null);
    });
  }, []);

  return {
    login,
    logout,
    isPending,
    error
  };
};
