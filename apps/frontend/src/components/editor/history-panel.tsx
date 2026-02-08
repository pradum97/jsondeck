"use client";

import { useMemo } from "react";
import { useEditorStore } from "@/stores/editor-store";

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.valueOf())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export function HistoryPanel() {
  const history = useEditorStore((state) => state.history);

  const items = useMemo(() => history.slice(0, 10), [history]);

  return (
    <section className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
          History
        </h3>
        <span className="text-[10px] text-slate-500">
          {history.length} entries
        </span>
      </div>
      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <p className="text-xs text-slate-500">
            Actions will appear here as you edit.
          </p>
        ) : (
          items.map((entry) => (
            <div
              key={entry.id}
              className="rounded-xl border border-slate-800/70 bg-slate-900/40 px-3 py-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">
                  {entry.action}
                </span>
                <span className="text-[10px] text-slate-500">
                  {formatTime(entry.timestamp)}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">{entry.summary}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
