"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "@/lib/api";

export type AppConfig = {
  role: string;
  adsEnabled: boolean;
  adProfile: string;
};

type ConfigResponse = { config: AppConfig };

export const useConfig = () =>
  useQuery({
    queryKey: ["config"],
    queryFn: async () => {
      const response = await api.get<ConfigResponse>("/api/config");
      return response.data.config;
    },
  });

export const useCreateConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { adsEnabled?: boolean; adProfile?: string }) => {
      const response = await api.post<ConfigResponse>("/api/config", input);
      return response.data.config;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config"] });
    },
  });
};

export const useUpdateConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { adsEnabled?: boolean; adProfile?: string }) => {
      const response = await api.put<ConfigResponse>("/api/config", input);
      return response.data.config;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config"] });
    },
  });
};

export const useDeleteConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.delete("/api/config");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config"] });
    },
  });
};
