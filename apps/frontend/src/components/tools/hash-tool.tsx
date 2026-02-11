"use client";

import { useEffect, useState } from "react";
import { ToolCard } from "@/components/tools/tool-card";
import { hashText } from "@/lib/tool-utils";

const ALGORITHMS = ["SHA-256", "SHA-384", "SHA-512"] as const;

export function HashTool() {
  const [input, setInput] = useState("");
  const [algorithm, setAlgorithm] = useState<(typeof ALGORITHMS)[number]>("SHA-256");
  const [output, setOutput] = useState("");

  useEffect(() => {
    let isActive = true;
    if (!input) {
      setOutput("");
      return;
    }
    hashText(input, algorithm)
      .then((result) => {
        if (isActive) setOutput(result);
      })
      .catch(() => {
        if (isActive) setOutput("");
      });
    return () => {
      isActive = false;
    };
  }, [input, algorithm]);

  return (
    <ToolCard title="Hash Generator" description="Generate secure hashes for payloads and keys.">
      <div className="grid gap-4">
        <div className="flex flex-wrap gap-2">
          {ALGORITHMS.map((algo) => (
            <button
              key={algo}
              type="button"
              onClick={() => setAlgorithm(algo)}
              className={
                algorithm === algo
                  ? "rounded-full border border-blue-600 bg-blue-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:bg-blue-700 dark:border-cyan-400/60 dark:bg-cyan-500/10 dark:text-cyan-200 dark:hover:bg-cyan-500/20"
                  : "rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-300"
              }
            >
              {algo}
            </button>
          ))}
        </div>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Enter text to hash"
          className="min-h-[120px] w-full rounded-2xl border border-slate-300 bg-white dark:border-slate-800/70 dark:bg-slate-950/80 p-4 text-sm text-slate-900 placeholder:text-slate-500 dark:text-slate-200"
        />
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800/70 dark:bg-slate-900/60">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Digest</p>
          <pre className="mt-2 break-words text-xs text-slate-900 dark:text-slate-200">
            {output || "Hash will appear here."}
          </pre>
        </div>
      </div>
    </ToolCard>
  );
}
