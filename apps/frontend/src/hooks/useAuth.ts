"use client";

import { useMutation } from "@tanstack/react-query";

import api, { setAccessToken } from "@/lib/api";

type AuthResponse = { accessToken: string };

export const useLogin = () =>
  useMutation({
    mutationFn: async (input: { email: string; password: string }) => {
      const response = await api.post<AuthResponse>("/api/auth/login", input);
      return response.data;
    },
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
    },
  });

export const useLogout = () =>
  useMutation({
    mutationFn: async () => {
      await api.post("/api/auth/logout");
    },
    onSuccess: () => {
      setAccessToken(null);
    },
  });

export const useRefreshToken = () =>
  useMutation({
    mutationFn: async () => {
      const response = await api.post<AuthResponse>("/api/auth/refresh");
      return response.data;
    },
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
    },
  });
