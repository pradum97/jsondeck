"use client";

import { useMemo, useState } from "react";
import { ToolCard } from "@/components/tools/tool-card";
import { buildLineDiff, formatJson } from "@/lib/json-tools";
import { deepMerge } from "@/lib/tool-utils";
import type { JsonValue } from "@/lib/transformers";

export function JsonDiffTool() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");

  const formattedLeft = useMemo(() => formatJson(left), [left]);
  const formattedRight = useMemo(() => formatJson(right), [right]);

  const diff = useMemo(
    () => buildLineDiff(formattedLeft.value, formattedRight.value),
    [formattedLeft.value, formattedRight.value]
  );

  const merged = useMemo(() => {
    if (formattedLeft.diagnostic.status !== "valid" || formattedRight.diagnostic.status !== "valid") {
      return "Fix JSON to merge.";
    }
    const leftValue = JSON.parse(formattedLeft.value) as JsonValue;
    const rightValue = JSON.parse(formattedRight.value) as JsonValue;
    return JSON.stringify(deepMerge(leftValue, rightValue), null, 2);
  }, [formattedLeft, formattedRight]);

  return (
    <ToolCard
      title="JSON Diff & Merge"
      description="Compare payloads and generate merge-ready output."
    >
      <div className="grid gap-4">
        <div className="grid gap-3 lg:grid-cols-2">
          <textarea
            value={left}
            onChange={(event) => setLeft(event.target.value)}
            placeholder="Left JSON"
            className="min-h-[140px] w-full rounded-2xl border border-slate-800/70 bg-slate-950/80 p-4 text-sm text-slate-200 placeholder:text-slate-500"
          />
          <textarea
            value={right}
            onChange={(event) => setRight(event.target.value)}
            placeholder="Right JSON"
            className="min-h-[140px] w-full rounded-2xl border border-slate-800/70 bg-slate-950/80 p-4 text-sm text-slate-200 placeholder:text-slate-500"
          />
        </div>
        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Diff</p>
          <div className="mt-2 max-h-48 overflow-auto text-xs text-slate-200">
            {diff.length === 0 ? (
              <span className="text-slate-500">Paste JSON to compare.</span>
            ) : (
              diff.map((line, index) => (
                <div
                  key={`${line.type}-${index}`}
                  className={
                    line.type === "added"
                      ? "text-emerald-300"
                      : line.type === "removed"
                      ? "text-rose-300"
                      : "text-slate-400"
                  }
                >
                  {line.type === "added" ? "+" : line.type === "removed" ? "-" : " "}
                  {line.line}
                </div>
              ))
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Merged</p>
          <pre className="mt-2 max-h-48 overflow-auto text-xs text-slate-200">{merged}</pre>
        </div>
      </div>
    </ToolCard>
  );
}
