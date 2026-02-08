"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MonacoEditor } from "@/components/editor/monaco-editor";
import { ResizableSplit } from "@/components/editor/resizable-split";
import { cn } from "@/lib/utils";
import {
  TRANSFORM_TARGETS,
  TransformTarget,
  transformJson,
} from "@/lib/transformers";

const DEFAULT_INPUT = "";

export function TransformPage() {
  const [input, setInput] = useState(DEFAULT_INPUT);
  const [target, setTarget] = useState<TransformTarget>("TypeScript");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => transformJson(input, target), [input, target]);

  const handleCopy = async () => {
    if (!result.output) return;
    await navigator.clipboard.writeText(result.output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200">
            Transform Studio
          </p>
          <h1 className="text-3xl font-semibold text-white">
            JSON to anything, instantly
          </h1>
          <p className="text-sm text-slate-400">
            Convert structured data into production-ready types, schemas, and data
            formats.
          </p>
        </div>
        <motion.div
          className="rounded-3xl border border-slate-800/70 bg-slate-950/60 px-6 py-4 text-sm text-slate-300 shadow-lg"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
            Output
          </p>
          <p className="text-lg font-semibold text-white">{target}</p>
          <p
            className={cn(
              "text-xs",
              result.status === "valid" ? "text-cyan-300" : "text-rose-300"
            )}
          >
            {result.status === "valid" ? result.message : "Invalid JSON"}
          </p>
        </motion.div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-3xl border border-slate-800/70 bg-slate-950/50 p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Target Formats
              </p>
              <p className="text-sm text-slate-300">
                Pick a destination to generate code automatically.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-full border border-slate-700/70 bg-slate-900/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200 transition hover:border-cyan-400/60 hover:text-cyan-100"
            >
              {copied ? "Copied" : "Copy output"}
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {TRANSFORM_TARGETS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setTarget(option.id)}
                className={cn(
                  "rounded-2xl border px-4 py-3 text-left transition",
                  target === option.id
                    ? "border-cyan-400/60 bg-cyan-500/10 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                    : "border-slate-800/70 bg-slate-950/50 hover:border-slate-600/80"
                )}
              >
                <p className="text-sm font-semibold text-white">
                  {option.id}
                </p>
                <p className="text-xs text-slate-400">{option.description}</p>
              </button>
            ))}
          </div>
        </div>
        <motion.div
          className="rounded-3xl border border-slate-800/70 bg-slate-950/50 p-5"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Transform Insights
          </p>
          <div className="mt-4 space-y-4 text-sm text-slate-300">
            <div className="flex items-center justify-between rounded-2xl border border-slate-800/70 bg-slate-900/60 px-4 py-3">
              <span>Input size</span>
              <span className="text-slate-100">{input.length} chars</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-800/70 bg-slate-900/60 px-4 py-3">
              <span>Status</span>
              <span
                className={cn(
                  "font-semibold",
                  result.status === "valid" ? "text-cyan-300" : "text-rose-300"
                )}
              >
                {result.status === "valid" ? "Ready" : "Needs fixes"}
              </span>
            </div>
            <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Tip
              </p>
              <p className="text-sm text-slate-300">
                Use command palette to jump between editor, tools, and transforms.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="rounded-3xl border border-slate-800/70 bg-slate-950/50 p-4">
        <div className="mb-4 flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-slate-500">
          <span>Workspace</span>
          <span>{target} output</span>
        </div>
        <div className="h-[520px] rounded-3xl border border-slate-800/70 bg-slate-950/70 p-3">
          <ResizableSplit
            initialRatio={0.55}
            left={
              <div className="flex h-full flex-col gap-3 pr-2">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-slate-500">
                  <span>JSON input</span>
                  <span className="text-cyan-300">Paste payloads</span>
                </div>
                <div className="h-full">
                  <MonacoEditor value={input} onChange={setInput} />
                </div>
              </div>
            }
            right={
              <div className="flex h-full flex-col gap-3 pl-2">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-slate-500">
                  <span>Generated output</span>
                  <span
                    className={cn(
                      "text-cyan-300",
                      result.status !== "valid" && "text-rose-300"
                    )}
                  >
                    {result.status === "valid" ? "Ready" : "Error"}
                  </span>
                </div>
                <div className="h-full overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-950/80">
                  <pre className="h-full overflow-auto p-4 text-sm text-slate-200">
                    {result.output || "Paste JSON to generate output."}
                  </pre>
                </div>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}
