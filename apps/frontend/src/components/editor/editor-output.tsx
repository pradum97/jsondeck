"use client";

import { memo, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useEditorStore } from "@/store/editor-store";
import { cn } from "@/lib/utils";

type JsonPrimitive = string | number | boolean | null;
type JsonData = JsonPrimitive | JsonData[] | { [key: string]: JsonData };

type EditorOutputProps = {
  formatted: string;
};

type ViewMode = "raw" | "tree" | "table";

type FlatRow = { path: string; key: string; value: string; type: string };

type TreeNodeProps = {
  path: string;
  label: string;
  value: JsonData;
  search: string;
  collapseDepth: number;
  level: number;
};

const VIRTUAL_WINDOW = 180;

function parseJson(value: string): JsonData | null {
  try {
    return JSON.parse(value) as JsonData;
  } catch {
    return null;
  }
}

function toFlatRows(value: JsonData, basePath = "$", key = "root"): FlatRow[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => toFlatRows(item, `${basePath}[${index}]`, String(index)));
  }
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([childKey, child]) => toFlatRows(child, `${basePath}.${childKey}`, childKey));
  }

  return [{ path: basePath, key, value: String(value), type: value === null ? "null" : typeof value }];
}

function highlightText(content: string, query: string) {
  if (!query.trim()) return <>{content}</>;
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escapedQuery})`, "ig");
  const parts = content.split(regex);
  return (
    <>
      {parts.map((part, index) => (
        <span key={`${part}-${index}`} className={part.toLowerCase() === query.toLowerCase() ? "rounded bg-accent-soft text-accent" : undefined}>
          {part}
        </span>
      ))}
    </>
  );
}

function TreeNode({ path, label, value, search, collapseDepth, level }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(collapseDepth === 0 || level < collapseDepth);
  const textBlob = `${label}:${JSON.stringify(value)}`.toLowerCase();
  const match = !search || textBlob.includes(search.toLowerCase());

  if (Array.isArray(value) || (value && typeof value === "object")) {
    const entries = Array.isArray(value) ? value.map((item, index) => [String(index), item] as const) : Object.entries(value);

    return (
      <div className="pl-3">
        <button type="button" onClick={() => setExpanded((prev) => !prev)} className={cn("text-left text-xs transition-colors", match ? "text-accent" : "text-secondary hover:text-text")}>
          {expanded ? "▼" : "▶"} {highlightText(label, search)}
        </button>
        {expanded ? (
          <div className="border-l border-border/50 pl-2">
            {entries.map(([childLabel, childValue]) => (
              <TreeNode key={`${path}.${childLabel}`} path={`${path}.${childLabel}`} label={childLabel} value={childValue} search={search} collapseDepth={collapseDepth} level={level + 1} />
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2 pl-3 text-xs", match ? "text-accent" : "text-secondary")}>
      <span className="text-muted">{highlightText(label, search)}:</span>
      <span>{highlightText(String(value), search)}</span>
      <span className="rounded-full border border-border px-1.5 py-0 text-[9px] uppercase tracking-[0.12em] text-muted">{value === null ? "null" : typeof value}</span>
      <button type="button" className="ml-1 rounded border border-border px-2 py-0.5 text-[10px] transition-colors hover:border-accent" onClick={() => void navigator.clipboard.writeText(path)}>
        path
      </button>
      <button type="button" className="rounded border border-border px-2 py-0.5 text-[10px] transition-colors hover:border-accent" onClick={() => void navigator.clipboard.writeText(JSON.stringify(value))}>
        node
      </button>
    </div>
  );
}

function EditorOutputBase({ formatted }: EditorOutputProps) {
  const diagnostics = useEditorStore((state) => state.diagnostics);
  const output = useEditorStore((state) => state.output);
  const [view, setView] = useState<ViewMode>("raw");
  const [search, setSearch] = useState("");
  const [keyFilter, setKeyFilter] = useState("");
  const [valueFilter, setValueFilter] = useState("");
  const [collapseDepth, setCollapseDepth] = useState(0);
  const displayText = output || formatted;
  const parsed = useMemo(() => parseJson(displayText), [displayText]);

  const filteredRawLines = useMemo(() => {
    const lines = displayText.split("\n");
    if (!search.trim()) return lines;
    return lines.filter((line) => line.toLowerCase().includes(search.toLowerCase()));
  }, [displayText, search]);

  const rows = useMemo(() => (parsed ? toFlatRows(parsed) : []), [parsed]);
  const filteredRows = useMemo(() => rows.filter((row) => {
    const keyMatch = !keyFilter.trim() || row.key.toLowerCase().includes(keyFilter.toLowerCase());
    const valueMatch = !valueFilter.trim() || row.value.toLowerCase().includes(valueFilter.toLowerCase());
    const searchMatch = !search.trim() || `${row.path}${row.value}${row.key}`.toLowerCase().includes(search.toLowerCase());
    return keyMatch && valueMatch && searchMatch;
  }), [keyFilter, rows, search, valueFilter]);

  const visibleRows = filteredRows.slice(0, VIRTUAL_WINDOW);
  const visibleRawLines = filteredRawLines.slice(0, VIRTUAL_WINDOW * 2);

  return (
    <div className="flex h-full min-h-0 flex-col rounded-xl border border-border bg-card shadow-inner">
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1.5 border-b border-border bg-card/95 px-2.5 py-2 backdrop-blur">
        <p className={cn("mr-auto text-xs font-semibold", diagnostics.status === "error" ? "text-error" : "text-success")}>{diagnostics.message}</p>
        {(["raw", "tree", "table"] as const).map((tab) => (
          <motion.button key={tab} type="button" onClick={() => setView(tab)} whileHover={{ y: -1 }} className={cn("h-7 rounded-full border px-2.5 text-[10px] uppercase tracking-[0.16em] transition", view === tab ? "border-accent bg-accent-soft text-accent" : "border-border text-secondary hover:border-accent")}>
            {tab}
          </motion.button>
        ))}
      </div>

      <div className="grid gap-1.5 border-b border-border px-2.5 py-2 sm:grid-cols-2 lg:grid-cols-4">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search" className="h-8 rounded-lg border border-border bg-section px-2.5 text-xs text-secondary" />
        <input value={keyFilter} onChange={(event) => setKeyFilter(event.target.value)} placeholder="Filter key" className="h-8 rounded-lg border border-border bg-section px-2.5 text-xs text-secondary" />
        <input value={valueFilter} onChange={(event) => setValueFilter(event.target.value)} placeholder="Filter value" className="h-8 rounded-lg border border-border bg-section px-2.5 text-xs text-secondary" />
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={() => setCollapseDepth(0)} className="h-8 rounded-lg border border-border px-2 text-[10px] uppercase tracking-[0.12em] text-secondary transition hover:border-accent">Expand</button>
          <button type="button" onClick={() => setCollapseDepth(1)} className="h-8 rounded-lg border border-border px-2 text-[10px] uppercase tracking-[0.12em] text-secondary transition hover:border-accent">Depth 1</button>
          <button type="button" onClick={() => setCollapseDepth(2)} className="h-8 rounded-lg border border-border px-2 text-[10px] uppercase tracking-[0.12em] text-secondary transition hover:border-accent">Depth 2</button>
          <button type="button" onClick={() => void navigator.clipboard.writeText(displayText)} className="h-8 rounded-lg border border-border px-2 text-[10px] uppercase tracking-[0.12em] text-secondary transition hover:border-accent">Copy</button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden p-2">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={view} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }} className="h-full">
            {view === "raw" ? (
              <pre className="h-full overflow-auto whitespace-pre-wrap rounded-xl border border-border bg-card p-2.5 font-mono text-xs leading-relaxed text-secondary">
                {visibleRawLines.map((line, index) => <div key={`${index}-${line}`}>{highlightText(line, search)}</div>)}
              </pre>
            ) : null}

            {view === "tree" ? parsed ? (
              <div className="h-full overflow-auto rounded-xl border border-border bg-card p-2.5 font-mono">
                <TreeNode path="$" label="$" value={parsed} search={search} collapseDepth={collapseDepth} level={0} />
              </div>
            ) : <p className="text-sm text-muted">Valid JSON is required for tree view.</p> : null}

            {view === "table" ? parsed ? (
              <div className="h-full overflow-auto rounded-xl border border-border bg-card p-2.5">
                <table className="w-full text-left text-xs text-secondary">
                  <thead className="sticky top-0 bg-card text-muted">
                    <tr>
                      <th className="pb-2">Path</th>
                      <th className="pb-2">Type</th>
                      <th className="pb-2">Value</th>
                      <th className="pb-2">Copy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRows.map((row) => (
                      <tr key={row.path} className="border-t border-border align-top">
                        <td className="py-1 pr-2 font-mono text-accent">{highlightText(row.path, search)}</td>
                        <td className="py-1 pr-2"><span className="rounded-full border border-border px-1.5 py-0 text-[9px] uppercase tracking-[0.1em] text-secondary">{row.type}</span></td>
                        <td className="py-1">{highlightText(row.value, search)}</td>
                        <td className="py-1">
                          <button type="button" className="rounded border border-border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-secondary transition hover:border-accent" onClick={() => void navigator.clipboard.writeText(row.path)}>Path</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredRows.length > visibleRows.length ? <p className="pt-2 text-[11px] text-muted">Showing first {visibleRows.length} rows for performance.</p> : null}
              </div>
            ) : <p className="text-sm text-muted">Valid JSON is required for table view.</p> : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export const EditorOutput = memo(EditorOutputBase);
