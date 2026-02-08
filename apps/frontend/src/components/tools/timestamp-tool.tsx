"use client";

import { useMemo, useState } from "react";
import { ToolCard } from "@/components/tools/tool-card";

export function TimestampTool() {
  const [epoch, setEpoch] = useState(String(Date.now()));
  const [iso, setIso] = useState(new Date().toISOString());

  const parsedEpoch = useMemo(() => {
    const value = Number(epoch);
    if (Number.isNaN(value)) return null;
    return new Date(value);
  }, [epoch]);

  const parsedIso = useMemo(() => {
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? null : date;
  }, [iso]);

  return (
    <ToolCard
      title="Timestamp Converter"
      description="Switch between epoch milliseconds and ISO 8601."
    >
      <div className="grid gap-4">
        <div className="grid gap-3 lg:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Epoch (ms)
            </label>
            <input
              value={epoch}
              onChange={(event) => setEpoch(event.target.value)}
              className="w-full rounded-2xl border border-slate-800/70 bg-slate-950/80 px-4 py-2 text-sm text-slate-200"
            />
            <p className="text-xs text-slate-400">
              {parsedEpoch ? parsedEpoch.toUTCString() : "Invalid epoch"}
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
              ISO 8601
            </label>
            <input
              value={iso}
              onChange={(event) => setIso(event.target.value)}
              className="w-full rounded-2xl border border-slate-800/70 bg-slate-950/80 px-4 py-2 text-sm text-slate-200"
            />
            <p className="text-xs text-slate-400">
              {parsedIso ? parsedIso.getTime() : "Invalid ISO"}
            </p>
          </div>
        </div>
      </div>
    </ToolCard>
  );
}
