"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export interface AnalyticsSummary {
  totals: {
    users: number;
    activeUsers: number;
    projects: number;
    documents: number;
  };
  subscriptions: {
    total: number;
    active: number;
    trialing: number;
    pastDue: number;
    canceled: number;
  };
  revenue: {
    monthlyRecurringCents: number;
    annualRecurringCents: number;
  };
}

export interface AnalyticsUsage {
  toolUsage: Array<{ tool: string; count: number }>;
  apiUsage: {
    totalRequests: number;
    methods: Array<{ method: string; count: number }>;
  };
  dailyTraffic: Array<{ date: string; requests: number; projects: number; documents: number; users: number }>;
}

export interface AnalyticsRevenue {
  totals: {
    recognizedCents: number;
    monthlyRecurringCents: number;
    annualRecurringCents: number;
  };
  subscriptions: Array<{ planCode: string; interval: string; seats: number; count: number; revenueCents: number }>;
  dailyRevenue: Array<{ date: string; revenueCents: number }>;
}

interface DateRangeParams {
  startDate: string;
  endDate: string;
}

const paramsFromRange = (range: DateRangeParams) => ({ startDate: range.startDate, endDate: range.endDate });

export const useAnalyticsSummary = (range: DateRangeParams) =>
  useQuery({
    queryKey: ["analytics", "summary", range],
    queryFn: async () => {
      const response = await api.get<AnalyticsSummary>("/api/analytics/summary", {
        params: paramsFromRange(range),
      });
      return response.data;
    },
  });

export const useAnalyticsUsage = (range: DateRangeParams) =>
  useQuery({
    queryKey: ["analytics", "usage", range],
    queryFn: async () => {
      const response = await api.get<AnalyticsUsage>("/api/analytics/usage", {
        params: paramsFromRange(range),
      });
      return response.data;
    },
  });

export const useAnalyticsRevenue = (range: DateRangeParams) =>
  useQuery({
    queryKey: ["analytics", "revenue", range],
    queryFn: async () => {
      const response = await api.get<AnalyticsRevenue>("/api/analytics/revenue", {
        params: paramsFromRange(range),
      });
      return response.data;
    },
  });
