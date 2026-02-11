"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import type { editor } from "monaco-editor";
import { buildLineDiff } from "@/lib/json-tools";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

type CompareOptions = {
  ignoreOrder: boolean;
  ignoreWhitespace: boolean;
};

function sortDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortDeep);
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b));
    return Object.fromEntries(entries.map(([key, nested]) => [key, sortDeep(nested)]));
  }
  return value;
}

function normalize(value: string, options: CompareOptions): string {
  try {
    const parsed = JSON.parse(value) as unknown;
    const deepSorted = options.ignoreOrder ? sortDeep(parsed) : parsed;
    const formatted = JSON.stringify(deepSorted, null, 2);
    return options.ignoreWhitespace ? formatted.replace(/\s+/g, "") : formatted;
  } catch {
    return options.ignoreWhitespace ? value.replace(/\s+/g, "") : value;
  }
}

export function JsonDiffPage() {
  const { resolvedTheme } = useTheme();
  const [left, setLeft] = useState("{\n  \"service\": \"billing\",\n  \"region\": \"us-east-1\"\n}");
  const [right, setRight] = useState("{\n  \"service\": \"billing\",\n  \"region\": \"eu-west-1\"\n}");
  const [ignoreOrder, setIgnoreOrder] = useState(false);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(true);
  const leftEditorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const rightEditorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const diff = useMemo(() => buildLineDiff(normalize(left, { ignoreOrder, ignoreWhitespace }), normalize(right, { ignoreOrder, ignoreWhitespace })), [ignoreOrder, ignoreWhitespace, left, right]);

  const compare = () => {
    try {
      setLeft(JSON.stringify(JSON.parse(left) as unknown, null, 2));
      setRight(JSON.stringify(JSON.parse(right) as unknown, null, 2));
    } catch {
      // keep raw input for diagnostics
    }
  };

  const syncScroll = (source: "left" | "right") => {
    const sourceEditor = source === "left" ? leftEditorRef.current : rightEditorRef.current;
    const targetEditor = source === "left" ? rightEditorRef.current : leftEditorRef.current;
    if (!sourceEditor || !targetEditor) {
      return;
    }
    targetEditor.setScrollTop(sourceEditor.getScrollTop());
  };

  return (
    <main className="flex h-full flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={compare} className="h-10 rounded-xl bg-accent-soft px-4 text-xs uppercase tracking-[0.2em] text-accent">Compare</button>
        <button type="button" onClick={() => { setLeft(""); setRight(""); }} className="h-10 rounded-xl border border-border px-4 text-xs uppercase tracking-[0.2em] text-secondary">Clear</button>
        <button type="button" onClick={() => { setLeft(right); setRight(left); }} className="h-10 rounded-xl border border-border px-4 text-xs uppercase tracking-[0.2em] text-secondary">Swap JSON</button>
        <button type="button" onClick={() => void navigator.clipboard.writeText(left)} className="h-10 rounded-xl border border-border px-4 text-xs uppercase tracking-[0.2em] text-secondary">Copy Left</button>
        <button type="button" onClick={() => void navigator.clipboard.writeText(right)} className="h-10 rounded-xl border border-border px-4 text-xs uppercase tracking-[0.2em] text-secondary">Copy Right</button>
        <label className="ml-2 flex items-center gap-2 text-xs text-secondary"><input type="checkbox" checked={ignoreOrder} onChange={(event) => setIgnoreOrder(event.target.checked)} />Ignore order</label>
        <label className="flex items-center gap-2 text-xs text-secondary"><input type="checkbox" checked={ignoreWhitespace} onChange={(event) => setIgnoreWhitespace(event.target.checked)} />Ignore whitespace</label>
      </div>

      <div className="grid h-[62vh] min-h-[360px] gap-3 md:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-border">
          <MonacoEditor
            height="100%"
            language="json"
            theme={resolvedTheme === "light" ? "vs-light" : "vs-dark"}
            value={left}
            onChange={(value) => setLeft(value ?? "")}
            onMount={(editorInstance) => {
              leftEditorRef.current = editorInstance;
              editorInstance.onDidScrollChange(() => syncScroll("left"));
            }}
            options={{ minimap: { enabled: false }, automaticLayout: true, scrollBeyondLastLine: false }}
          />
        </div>
        <div className="overflow-hidden rounded-2xl border border-border">
          <MonacoEditor
            height="100%"
            language="json"
            theme={resolvedTheme === "light" ? "vs-light" : "vs-dark"}
            value={right}
            onChange={(value) => setRight(value ?? "")}
            onMount={(editorInstance) => {
              rightEditorRef.current = editorInstance;
              editorInstance.onDidScrollChange(() => syncScroll("right"));
            }}
            options={{ minimap: { enabled: false }, automaticLayout: true, scrollBeyondLastLine: false }}
          />
        </div>
      </div>

      <div className="max-h-48 overflow-auto rounded-2xl border border-border bg-card p-3 font-mono text-xs">
        {diff.length === 0 ? <p className="text-muted">No differences detected.</p> : diff.map((line, index) => (
          <p key={`${line.type}-${index}`} className={line.type === "added" ? "bg-success/10 text-success" : line.type === "removed" ? "bg-error/10 text-error" : "text-muted"}>
            {line.type === "added" ? "+" : line.type === "removed" ? "-" : " "} {line.line}
          </p>
        ))}
      </div>
    </main>
  );
}
