"use client";

import { useMemo, useState } from "react";
import { ToolCard } from "@/components/tools/tool-card";

export function RegexTool() {
  const [pattern, setPattern] = useState("" );
  const [flags, setFlags] = useState("g");
  const [text, setText] = useState("");

  const matches = useMemo(() => {
    if (!pattern) return [] as string[];
    try {
      const regex = new RegExp(pattern, flags);
      return Array.from(text.matchAll(regex), (match) => match[0]);
    } catch {
      return [] as string[];
    }
  }, [pattern, flags, text]);

  return (
    <ToolCard
      title="Regex Lab"
      description="Test expressions and capture matches in real time."
    >
      <div className="grid gap-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <input
            value={pattern}
            onChange={(event) => setPattern(event.target.value)}
            placeholder="Enter regex pattern"
            className="w-full rounded-2xl border border-slate-800/70 bg-slate-950/80 px-4 py-2 text-sm text-slate-200 placeholder:text-slate-500"
          />
          <input
            value={flags}
            onChange={(event) => setFlags(event.target.value)}
            placeholder="Flags"
            className="w-full rounded-2xl border border-slate-800/70 bg-slate-950/80 px-4 py-2 text-sm text-slate-200 placeholder:text-slate-500"
          />
        </div>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Paste text to test"
          className="min-h-[120px] w-full rounded-2xl border border-slate-800/70 bg-slate-950/80 p-4 text-sm text-slate-200 placeholder:text-slate-500"
        />
        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Matches</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {matches.length ? (
              matches.map((match, index) => (
                <span
                  key={`${match}-${index}`}
                  className="rounded-full border border-cyan-400/50 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-100"
                >
                  {match}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500">No matches yet.</span>
            )}
          </div>
        </div>
      </div>
    </ToolCard>
  );
}
