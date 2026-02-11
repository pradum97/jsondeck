"use client";

import { useState } from "react";
import { ToolCard } from "@/components/tools/tool-card";
import { generateUuid } from "@/lib/tool-utils";

export function UuidTool() {
  const [uuids, setUuids] = useState<string[]>([generateUuid()]);

  const handleGenerate = () => {
    setUuids((prev) => [generateUuid(), ...prev].slice(0, 5));
  };

  return (
    <ToolCard
      title="UUID Generator"
      description="Generate cryptographically strong UUIDs for identifiers."
    >
      <div className="space-y-4">
        <button
          type="button"
          onClick={handleGenerate}
          className="rounded-full border border-blue-600 bg-blue-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-blue-700 dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-cyan-200 dark:hover:border-cyan-400/60 dark:hover:bg-slate-900/70"
        >
          Generate
        </button>
        <div className="space-y-2">
          {uuids.map((uuid) => (
            <div
              key={uuid}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 dark:border-slate-800/70 dark:bg-slate-900/60 dark:text-slate-200"
            >
              {uuid}
            </div>
          ))}
        </div>
      </div>
    </ToolCard>
  );
}
