"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { MonacoEditor } from "@/components/editor/monaco-editor";
import { ResizableSplit } from "@/components/editor/resizable-split";
import { cn } from "@/lib/utils";
import { TransformTarget, type TransformResult } from "@/lib/transformers";

const TARGET_OPTIONS: TransformTarget[] = ["TypeScript", "Java", "C#", "Python", "YAML", "CSV", "XML", "SQL", "GraphQL"];

export function TransformPage() {
  const { resolvedTheme } = useTheme();
  const [input, setInput] = useState("");
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
    workerRef.current?.postMessage({ input, target });
  }, [input, target]);

  const handleCopy = async () => {
    if (!result.output) return;
    await navigator.clipboard.writeText(result.output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="flex min-h-[calc(100vh-var(--navbar-height)-3.25rem)] flex-1 flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card px-3 py-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Transform</span>
          <span className={cn(result.status === "valid" ? "text-emerald-500" : "text-red-400")}>{result.message}</span>
        </div>
        <div className="flex items-center gap-2">
          <select value={target} onChange={(event) => setTarget(event.target.value as TransformTarget)} className="h-9 min-w-[170px] rounded-lg border border-border bg-card px-3 text-sm text-foreground">
            {TARGET_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <button type="button" onClick={handleCopy} className="h-9 rounded-lg bg-[#2563eb] px-4 text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-blue-700">
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 rounded-xl border border-border bg-card p-2">
        <div className="h-full min-h-0 overflow-hidden rounded-lg border border-border bg-background">
          <ResizableSplit
            initialRatio={0.52}
            left={
              <div className="flex h-full min-h-0 flex-col border-r border-border">
                <div className="border-b border-border px-3 py-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">Source JSON</div>
                <div className="min-h-0 flex-1">
                  <MonacoEditor
                    theme={resolvedTheme === "dark" ? "vs-dark" : "vs-light"}
                    value={input}
                    onChange={(next) => setInput(next ?? "")}
                    options={{ minimap: { enabled: false }, fontSize: 14, lineHeight: 22, automaticLayout: true, scrollBeyondLastLine: false }}
                  />
                </div>
              </div>
            }
            right={
              <div className="flex h-full min-h-0 flex-col">
                <div className="border-b border-border px-3 py-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">Output ({target})</div>
                <pre className="min-h-0 flex-1 overflow-auto p-4 text-sm leading-6 text-foreground">{result.output || "Paste JSON to generate output."}</pre>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}
