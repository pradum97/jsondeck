"use client";

import { motion } from "framer-motion";
import { useEditorStore } from "@/store/editor-store";

export function EditorHistory() {
  const history = useEditorStore((state) => state.history);

  return (
    <div className="space-y-3 rounded-3xl border border-slate-800/70 bg-slate-950/60 p-4 shadow-inner">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          History
        </p>
        <span className="rounded-full border border-slate-800/80 px-3 py-1 text-[10px] text-slate-500">
          Recent
        </span>
      </div>
      <div className="space-y-2">
        {history.length === 0 ? (
          <p className="text-xs text-slate-500">
            No actions yet. Format, minify, or validate to build a trail.
          </p>
        ) : (
          history.map((entry) => (
            <motion.div
              key={entry.id}
              layout
              className="rounded-2xl border border-slate-800/80 bg-slate-900/60 px-3 py-2 text-xs text-slate-300"
            >
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-cyan-200">
                <span>{entry.action}</span>
                <span className="text-slate-500">{entry.timestamp}</span>
              </div>
              <p className="text-[11px] text-slate-400">{entry.summary}</p>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
