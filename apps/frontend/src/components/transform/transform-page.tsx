"use client";

import { useEffect, useRef, useState } from "react";
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
  const [result, setResult] = useState<TransformResult>({ output: "", status: "error", message: "Paste JSON to generate output." });
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const worker = new Worker(new URL("@/workers/transform.worker.ts", import.meta.url));
    worker.onmessage = (event: MessageEvent<TransformResult>) => setResult(event.data);
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
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2">
        <p className="text-sm font-semibold text-[color:var(--text)]">Transform Studio</p>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <select value={target} onChange={(event) => setTarget(event.target.value as TransformTarget)} className="h-9 min-w-[140px] rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 text-sm text-[color:var(--text)]">
            {TARGET_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <button type="button" onClick={handleCopy} className="h-9 rounded-lg bg-[color:var(--accent)] px-4 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--surface)] hover:bg-[color:var(--accent-hover)]">
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-2">
        <div className="mb-2 flex items-center justify-between text-xs text-[color:var(--muted)]">
          <span>Source JSON</span>
          <span className={cn(result.status === "valid" ? "text-[color:var(--success)]" : "text-[color:var(--error)]")}>
            {result.status === "valid" ? result.message : "Invalid JSON"}
          </span>
        </div>

        <div className="h-full min-h-0 overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--bg)]">
          <ResizableSplit
            initialRatio={0.5}
            left={
              <div className="h-full overflow-hidden border-r border-[color:var(--border)]">
                <MonacoEditor
                  theme={resolvedTheme === "dark" ? "vs-dark" : "vs-light"}
                  value={input}
                  onChange={setInput}
                  options={{ minimap: { enabled: false }, fontSize: 17, lineHeight: 24, automaticLayout: true, scrollBeyondLastLine: false }}
                />
              </div>
            }
            right={
              <div className="h-full overflow-hidden">
                <pre className="h-full overflow-auto p-4 text-sm leading-6 text-[color:var(--text)]">
                  {result.output || "Paste JSON to generate output."}
                </pre>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}
