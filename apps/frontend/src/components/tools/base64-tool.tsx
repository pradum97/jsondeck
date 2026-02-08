"use client";

import { useState } from "react";
import { ToolCard } from "@/components/tools/tool-card";
import { base64Decode, base64Encode } from "@/lib/tool-utils";

export function Base64Tool() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");

  const output = mode === "encode" ? base64Encode(input) : base64Decode(input);

  return (
    <ToolCard
      title="Base64 Studio"
      description="Encode or decode payloads for headers and transport."
    >
      <div className="grid gap-4">
        <div className="flex flex-wrap gap-2">
          {(["encode", "decode"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              className={
                mode === value
                  ? "rounded-full border border-cyan-400/60 bg-cyan-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200"
                  : "rounded-full border border-slate-700/70 bg-slate-900/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300"
              }
            >
              {value}
            </button>
          ))}
        </div>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Enter text to encode or base64 payload to decode"
          className="min-h-[120px] w-full rounded-2xl border border-slate-800/70 bg-slate-950/80 p-4 text-sm text-slate-200 placeholder:text-slate-500"
        />
        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Output</p>
          <pre className="mt-2 max-h-32 overflow-auto text-xs text-slate-200">
            {output || "Output will appear here."}
          </pre>
        </div>
      </div>
    </ToolCard>
  );
}
