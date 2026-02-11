"use client";

import { memo, useMemo, useState } from "react";
import { useEditorStore } from "@/store/editor-store";
import { cn } from "@/lib/utils";

type JsonPrimitive = string | number | boolean | null;
type JsonData = JsonPrimitive | JsonData[] | { [key: string]: JsonData };

type EditorOutputProps = {
  formatted: string;
};

type ViewMode = "raw" | "tree" | "table";

type FlatRow = { path: string; value: string; type: string };

function parseJson(value: string): JsonData | null {
  try {
    return JSON.parse(value) as JsonData;
  } catch {
    return null;
  }
}

function toFlatRows(value: JsonData, basePath = "$"): FlatRow[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => toFlatRows(item, `${basePath}[${index}]`));
  }
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) => toFlatRows(child, `${basePath}.${key}`));
  }

  return [{ path: basePath, value: String(value), type: value === null ? "null" : typeof value }];
}

function TreeNode({
  path,
  label,
  value,
  query,
}: {
  path: string;
  label: string;
  value: JsonData;
  query: string;
}) {
  const [expanded, setExpanded] = useState(true);
  const match = `${label}:${JSON.stringify(value)}`.toLowerCase().includes(query.toLowerCase());

  if (Array.isArray(value) || (value && typeof value === "object")) {
    const entries = Array.isArray(value)
      ? value.map((item, index) => [String(index), item] as const)
      : Object.entries(value);

    return (
      <div className="pl-3">
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className={cn("text-left text-xs", match ? "text-cyan-200" : "text-slate-300")}
        >
          {expanded ? "▼" : "▶"} {label}
        </button>
        {expanded ? (
          <div className="border-l border-slate-700/50 pl-2">
            {entries.map(([childLabel, childValue]) => (
              <TreeNode key={`${path}.${childLabel}`} path={`${path}.${childLabel}`} label={childLabel} value={childValue} query={query} />
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn("pl-3 text-xs", match ? "text-cyan-200" : "text-slate-300")}>
      <span className="text-slate-400">{label}:</span> {String(value)}
      <button
        type="button"
        className="ml-2 rounded border border-slate-700 px-2 py-0.5 text-[10px]"
        onClick={() => void navigator.clipboard.writeText(path)}
      >
        copy path
      </button>
    </div>
  );
}

function EditorOutputBase({ formatted }: EditorOutputProps) {
  const diagnostics = useEditorStore((state) => state.diagnostics);
  const output = useEditorStore((state) => state.output);
  const [view, setView] = useState<ViewMode>("raw");
  const [query, setQuery] = useState("");
  const displayText = output || formatted;
  const parsed = useMemo(() => parseJson(displayText), [displayText]);

  const filteredRaw = useMemo(() => {
    if (!query) {
      return displayText;
    }
    return displayText
      .split("\n")
      .filter((line) => line.toLowerCase().includes(query.toLowerCase()))
      .join("\n");
  }, [displayText, query]);

  const rows = useMemo(() => (parsed ? toFlatRows(parsed) : []), [parsed]);

  return (
    <div className="flex h-full flex-col gap-3 rounded-3xl border border-slate-800/70 bg-slate-950/70 p-4 shadow-inner">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className={cn("text-sm font-semibold", diagnostics.status === "error" ? "text-rose-300" : "text-emerald-300")}>
          {diagnostics.message}
        </p>
        <div className="flex items-center gap-2">
          {(["raw", "tree", "table"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setView(tab)}
              className={cn(
                "rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.2em]",
                view === tab ? "border-cyan-400/60 bg-cyan-500/20 text-cyan-100" : "border-slate-700 text-slate-300"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search output"
          className="h-10 w-full rounded-xl border border-slate-700/80 bg-slate-900/60 px-3 text-sm text-slate-200"
        />
        <button
          type="button"
          onClick={() => void navigator.clipboard.writeText(displayText)}
          className="h-10 rounded-xl border border-slate-700 px-3 text-xs uppercase tracking-[0.2em] text-slate-200"
        >
          Copy Object
        </button>
      </div>

      <div className="flex-1 overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-950/70 p-3 text-xs">
        {view === "raw" ? (
          <pre className="h-full overflow-auto whitespace-pre-wrap font-mono leading-relaxed text-slate-300">{filteredRaw}</pre>
        ) : null}

        {view === "tree" ? (
          parsed ? (
            <div className="h-full overflow-auto font-mono">
              <TreeNode path="$" label="$" value={parsed} query={query} />
            </div>
          ) : (
            <p className="text-slate-400">Valid JSON is required for tree view.</p>
          )
        ) : null}

        {view === "table" ? (
          parsed ? (
            <div className="h-full overflow-auto">
              <table className="w-full text-left text-xs text-slate-200">
                <thead className="text-slate-400">
                  <tr>
                    <th className="pb-2">Path</th>
                    <th className="pb-2">Type</th>
                    <th className="pb-2">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {rows
                    .filter((row) => !query || `${row.path}${row.value}`.toLowerCase().includes(query.toLowerCase()))
                    .map((row) => (
                      <tr key={row.path} className="border-t border-slate-800/60">
                        <td className="py-1 pr-2 font-mono text-cyan-200">{row.path}</td>
                        <td className="py-1 pr-2 text-slate-400">{row.type}</td>
                        <td className="py-1">{row.value}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-400">Valid JSON is required for table view.</p>
          )
        ) : null}
      </div>
    </div>
  );
}

export const EditorOutput = memo(EditorOutputBase);
