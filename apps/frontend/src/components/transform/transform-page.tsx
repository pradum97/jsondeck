"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { MonacoEditor } from "@/components/editor/monaco-editor";
import { ResizableSplit } from "@/components/editor/resizable-split";
import { cn } from "@/lib/utils";
import {
  TRANSFORM_TARGETS,
  TransformTarget,
  type TransformResult,
} from "@/lib/transformers";

const DEFAULT_INPUT = "";

export function TransformPage() {
  const { resolvedTheme } = useTheme();
  const [input, setInput] = useState(DEFAULT_INPUT);
  const [target, setTarget] = useState<TransformTarget>("TypeScript");
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<TransformResult>({
    output: "",
    status: "error",
    message: "Paste JSON to generate output.",
  });
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const worker = new Worker(
      new URL("@/workers/transform.worker.ts", import.meta.url)
    );
    worker.onmessage = (event: MessageEvent<TransformResult>) => {
      setResult(event.data);
    };
    workerRef.current = worker;
    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!workerRef.current) return;
    workerRef.current.postMessage({ input, target });
  }, [input, target]);

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
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent">
            Transform Studio
          </p>
          <h1 className="text-3xl font-semibold text-text">
            JSON to anything, instantly
          </h1>
          <p className="text-sm text-muted">
            Convert structured data into production-ready types, schemas, and data
            formats.
          </p>
        </div>
        <motion.div
          className="rounded-3xl border border-border bg-card px-6 py-4 text-sm text-secondary shadow-lg"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-xs uppercase tracking-[0.28em] text-muted">
            Output
          </p>
          <p className="text-lg font-semibold text-text">{target}</p>
          <p
            className={cn(
              "text-xs",
              result.status === "valid" ? "text-accent" : "text-error"
            )}
          >
            {result.status === "valid" ? result.message : "Invalid JSON"}
          </p>
        </motion.div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-3xl border border-border bg-card p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted">
                Target Formats
              </p>
              <p className="text-sm text-secondary">
                Pick a destination to generate code automatically.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-full border border-border bg-section px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent transition hover:border-accent hover:text-accent"
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
                    ? "border-accent bg-accent-soft shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                    : "border-border bg-card hover:border-border"
                )}
              >
                <p className="text-sm font-semibold text-text">
                  {option.id}
                </p>
                <p className="text-xs text-muted">{option.description}</p>
              </button>
            ))}
          </div>
        </div>
        <motion.div
          className="rounded-3xl border border-border bg-card p-5"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Transform Insights
          </p>
          <div className="mt-4 space-y-4 text-sm text-secondary">
            <div className="flex items-center justify-between rounded-2xl border border-border bg-section px-4 py-3">
              <span>Input size</span>
              <span className="text-text">{input.length} chars</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-border bg-section px-4 py-3">
              <span>Status</span>
              <span
                className={cn(
                  "font-semibold",
                  result.status === "valid" ? "text-accent" : "text-error"
                )}
              >
                {result.status === "valid" ? "Ready" : "Needs fixes"}
              </span>
            </div>
            <div className="rounded-2xl border border-border bg-section px-4 py-3">
              <p className="text-xs uppercase tracking-[0.3em] text-muted">
                Tip
              </p>
              <p className="text-sm text-secondary">
                Use command palette to jump between editor, tools, and transforms.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-4">
        <div className="mb-4 flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-muted">
          <span>Workspace</span>
          <span>{target} output</span>
        </div>
        <div className="h-[520px] rounded-3xl border border-border bg-card p-3">
          <ResizableSplit
            initialRatio={0.55}
            left={
              <div className="flex h-full flex-col gap-3 pr-2">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-muted">
                  <span>JSON input</span>
                  <span className="text-accent">Paste payloads</span>
                </div>
                <div className="h-full">
                  <MonacoEditor theme={resolvedTheme === "light" ? "vs-light" : "vs-dark"} value={input} onChange={setInput} />
                </div>
              </div>
            }
            right={
              <div className="flex h-full flex-col gap-3 pl-2">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-muted">
                  <span>Generated output</span>
                  <span
                    className={cn(
                      "text-accent",
                      result.status !== "valid" && "text-error"
                    )}
                  >
                    {result.status === "valid" ? "Ready" : "Error"}
                  </span>
                </div>
                <div className="h-full overflow-hidden rounded-2xl border border-border bg-card">
                  <pre className="h-full overflow-auto p-4 text-sm text-secondary">
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
