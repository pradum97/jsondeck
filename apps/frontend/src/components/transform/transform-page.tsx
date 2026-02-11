"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { MonacoEditor } from "@/components/editor/monaco-editor";
import { ResizableSplit } from "@/components/editor/resizable-split";
import { cn } from "@/lib/utils";
import { TransformTarget, type TransformResult } from "@/lib/transformers";

const DEFAULT_INPUT = "";
const TARGET_OPTIONS: TransformTarget[] = ["TypeScript", "Java", "C#", "Python", "YAML", "CSV", "XML", "SQL", "GraphQL"];

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
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm backdrop-blur-md">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-300">Transform Studio</p>
          <h1 className="text-2xl font-semibold text-slate-100">JSON Transform</h1>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={target}
            onChange={(event) => setTarget(event.target.value as TransformTarget)}
            className="h-10 rounded-lg border border-slate-800 bg-slate-900 px-3 text-sm text-slate-100"
          >
            {TARGET_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 hover:bg-slate-800 hover:text-slate-100"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      <motion.div className="min-h-0 flex-1 rounded-2xl border border-slate-800 bg-slate-900/50 p-3 shadow-sm" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <div className="mb-3 flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-slate-300">
          <span>JSON Editor</span>
          <span className={cn(result.status === "valid" ? "text-blue-300" : "text-red-300")}>
            {result.status === "valid" ? result.message : "Invalid JSON"}
          </span>
        </div>
        <div className="h-[560px] overflow-hidden rounded-xl border border-slate-800 bg-[#0b1220]">
          <ResizableSplit
            initialRatio={0.5}
            left={
              <div className="flex h-full flex-col gap-2 pr-2">
                <div className="text-[11px] uppercase tracking-[0.3em] text-slate-300">JSON Editor</div>
                <div className="h-full overflow-hidden rounded-lg border border-slate-800 bg-[#0b1220]">
                  <MonacoEditor
                    theme={resolvedTheme === "light" ? "vs-light" : "vs-dark"}
                    value={input}
                    onChange={setInput}
                    options={{ minimap: { enabled: false }, fontSize: 16, lineHeight: 22, automaticLayout: true, scrollBeyondLastLine: false }}
                  />
                </div>
              </div>
            }
            right={
              <div className="flex h-full flex-col gap-2 pl-2">
                <div className="text-[11px] uppercase tracking-[0.3em] text-slate-300">Output Preview</div>
                <div className="h-full overflow-hidden rounded-lg border border-slate-800 bg-slate-950/70">
                  <pre className="h-full overflow-auto p-4 text-sm text-slate-100">
                    {result.output || "Paste JSON to generate output."}
                  </pre>
                </div>
              </div>
            }
          />
        </div>
      </motion.div>
    </div>
  );
}
