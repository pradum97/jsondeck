"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAnalyticsRevenue, useAnalyticsSummary, useAnalyticsUsage } from "@/hooks/useAnalytics";

const formatCurrency = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100);

const toDateInput = (date: Date): string => date.toISOString().slice(0, 10);

const buildCsv = (rows: Array<Record<string, string | number>>): string => {
  if (!rows.length) {
    return "";
  }
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(",")];
  rows.forEach((row) => {
    lines.push(headers.map((header) => JSON.stringify(row[header] ?? "")).join(","));
  });
  return lines.join("\n");
};

const downloadCsv = (filename: string, content: string) => {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.setAttribute("download", filename);
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

export default function AdminAnalyticsPage() {
  const defaultEnd = new Date();
  const defaultStart = new Date(defaultEnd.getTime() - 29 * 86_400_000);
  const [startDate, setStartDate] = useState(toDateInput(defaultStart));
  const [endDate, setEndDate] = useState(toDateInput(defaultEnd));

  const range = useMemo(() => ({ startDate, endDate }), [startDate, endDate]);
  const summaryQuery = useAnalyticsSummary(range);
  const usageQuery = useAnalyticsUsage(range);
  const revenueQuery = useAnalyticsRevenue(range);

  const isLoading = summaryQuery.isLoading || usageQuery.isLoading || revenueQuery.isLoading;

  const exportCsv = () => {
    const rows = usageQuery.data?.dailyTraffic.map((row) => ({
      date: row.date,
      requests: row.requests,
      users: row.users,
      projects: row.projects,
      documents: row.documents,
    }));

    downloadCsv(`admin-analytics-${startDate}-to-${endDate}.csv`, buildCsv(rows ?? []));
  };

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-indigo-300/70">Admin analytics</p>
        <h1 className="text-3xl font-semibold text-white">Platform analytics dashboard</h1>
        <p className="text-sm text-slate-300">Track platform activity, subscriptions, API usage, and revenue performance.</p>
      </header>

      <section className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <label className="space-y-1 text-sm text-slate-300">
          Start date
          <input
            className="block rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
        </label>
        <label className="space-y-1 text-sm text-slate-300">
          End date
          <input
            className="block rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </label>
        <button
          type="button"
          onClick={exportCsv}
          className="rounded-lg border border-indigo-400/40 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-200 hover:bg-indigo-500/20"
        >
          Export CSV
        </button>
      </section>

      {isLoading ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-sm text-slate-300">Loading analytics...</div>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-4">
            {[{
              label: "Total users",
              value: summaryQuery.data?.totals.users ?? 0,
            }, {
              label: "Active users",
              value: summaryQuery.data?.totals.activeUsers ?? 0,
            }, {
              label: "Projects",
              value: summaryQuery.data?.totals.projects ?? 0,
            }, {
              label: "Documents",
              value: summaryQuery.data?.totals.documents ?? 0,
            }, {
              label: "API usage",
              value: usageQuery.data?.apiUsage.totalRequests ?? 0,
            }, {
              label: "Subscriptions",
              value: summaryQuery.data?.subscriptions.total ?? 0,
            }, {
              label: "MRR",
              value: formatCurrency(summaryQuery.data?.revenue.monthlyRecurringCents ?? 0),
            }, {
              label: "Recognized revenue",
              value: formatCurrency(revenueQuery.data?.totals.recognizedCents ?? 0),
            }].map((metric) => (
              <article key={metric.label} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{metric.label}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{metric.value}</p>
              </article>
            ))}
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <article className="h-80 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <h2 className="mb-4 text-sm font-medium text-slate-200">Daily traffic</h2>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={usageQuery.data?.dailyTraffic ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="requests" stroke="#22d3ee" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="users" stroke="#818cf8" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </article>

            <article className="h-80 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <h2 className="mb-4 text-sm font-medium text-slate-200">Tool usage</h2>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={usageQuery.data?.toolUsage ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="tool" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4f46e5" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </article>

            <article className="h-80 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <h2 className="mb-4 text-sm font-medium text-slate-200">API method usage</h2>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={usageQuery.data?.apiUsage.methods ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="method" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </article>

            <article className="h-80 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <h2 className="mb-4 text-sm font-medium text-slate-200">Daily revenue</h2>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueQuery.data?.dailyRevenue ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Line type="monotone" dataKey="revenueCents" stroke="#22c55e" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </article>
          </section>
        </>
      )}
    </div>
  );
}
