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

type FlatRow = { path: string; value: string; type: string };

type TreeNodeProps = {
  path: string;
  label: string;
  value: JsonData;
  query: string;
  collapsed: boolean;
};

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

function highlightText(content: string, query: string) {
  if (!query.trim()) return <>{content}</>;
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escapedQuery})`, "ig");
  const parts = content.split(regex);
  return (
    <>
      {parts.map((part, index) => (
        <span
          key={`${part}-${index}`}
          className={part.toLowerCase() === query.toLowerCase() ? "rounded bg-cyan-400/20 text-cyan-100" : undefined}
        >
          {part}
        </span>
      ))}
    </>
  );
}

function TreeNode({ path, label, value, query, collapsed }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(!collapsed);
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
          className={cn("text-left text-xs transition-colors", match ? "text-cyan-100" : "text-slate-300 hover:text-slate-100")}
        >
          {expanded ? "▼" : "▶"} {highlightText(label, query)}
        </button>
        {expanded ? (
          <div className="border-l border-slate-700/50 pl-2">
            {entries.map(([childLabel, childValue]) => (
              <TreeNode
                key={`${path}.${childLabel}`}
                path={`${path}.${childLabel}`}
                label={childLabel}
                value={childValue}
                query={query}
                collapsed={collapsed}
              />
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn("pl-3 text-xs", match ? "text-cyan-100" : "text-slate-300")}>
      <span className="text-slate-500">{highlightText(label, query)}:</span> {highlightText(String(value), query)}
      <button
        type="button"
        className="ml-2 rounded border border-slate-700 px-2 py-0.5 text-[10px] transition-colors hover:border-cyan-400/60"
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
  const [collapseAll, setCollapseAll] = useState(false);
  const displayText = output || formatted;
  const parsed = useMemo(() => parseJson(displayText), [displayText]);
  const filteredRawLines = useMemo(() => {
    if (!query.trim()) {
      return displayText.split("\n");
    }
    return displayText
      .split("\n")
      .filter((line) => line.toLowerCase().includes(query.toLowerCase()));
  }, [displayText, query]);

  const rows = useMemo(() => (parsed ? toFlatRows(parsed) : []), [parsed]);
  const filteredRows = useMemo(
    () => rows.filter((row) => !query.trim() || `${row.path}${row.value}`.toLowerCase().includes(query.toLowerCase())),
    [query, rows]
  );

  return (
    <div className="flex h-full min-h-0 flex-col rounded-2xl border border-slate-700/70 bg-slate-950/70 shadow-inner">
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 border-b border-slate-700/70 bg-slate-950/90 px-3 py-3 backdrop-blur">
        <p className={cn("mr-auto text-sm font-semibold", diagnostics.status === "error" ? "text-rose-300" : "text-emerald-300")}>
          {diagnostics.message}
        </p>
        {(["raw", "tree", "table"] as const).map((tab) => (
          <motion.button
            key={tab}
            type="button"
            onClick={() => setView(tab)}
            whileHover={{ y: -1 }}
            className={cn(
              "h-9 rounded-xl border px-3 text-[10px] uppercase tracking-[0.2em] transition",
              view === tab ? "border-cyan-400/60 bg-cyan-500/20 text-cyan-100" : "border-slate-700 text-slate-300 hover:border-slate-500"
            )}
          >
            {tab}
          </motion.button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800/80 px-3 py-2.5">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search / filter"
          className="h-9 min-w-[180px] flex-1 rounded-lg border border-slate-700/80 bg-slate-900/60 px-3 text-sm text-slate-200"
        />
        <button
          type="button"
          onClick={() => setCollapseAll(false)}
          className="h-9 rounded-lg border border-slate-700 px-3 text-xs uppercase tracking-[0.16em] text-slate-200 transition hover:border-slate-500"
        >
          Expand all
        </button>
        <button
          type="button"
          onClick={() => setCollapseAll(true)}
          className="h-9 rounded-lg border border-slate-700 px-3 text-xs uppercase tracking-[0.16em] text-slate-200 transition hover:border-slate-500"
        >
          Collapse all
        </button>
        <button
          type="button"
          onClick={() => void navigator.clipboard.writeText(displayText)}
          className="h-9 rounded-lg border border-slate-700 px-3 text-xs uppercase tracking-[0.16em] text-slate-200 transition hover:border-slate-500"
        >
          Copy object
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden p-3">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {view === "raw" ? (
              <pre className="h-full overflow-auto whitespace-pre-wrap rounded-xl border border-slate-800/70 bg-slate-950/70 p-3 font-mono text-xs leading-relaxed text-slate-300">
                {filteredRawLines.map((line, index) => (
                  <div key={`${index}-${line}`}>{highlightText(line, query)}</div>
                ))}
              </pre>
            ) : null}

            {view === "tree" ? (
              parsed ? (
                <div className="h-full overflow-auto rounded-xl border border-slate-800/70 bg-slate-950/70 p-3 font-mono">
                  <TreeNode key={collapseAll ? "collapsed" : "expanded"} path="$" label="$" value={parsed} query={query} collapsed={collapseAll} />
                </div>
              ) : (
                <p className="text-sm text-slate-400">Valid JSON is required for tree view.</p>
              )
            ) : null}

            {view === "table" ? (
              parsed ? (
                <div className="h-full overflow-auto rounded-xl border border-slate-800/70 bg-slate-950/70 p-3">
                  <table className="w-full text-left text-xs text-slate-200">
                    <thead className="sticky top-0 bg-slate-950/95 text-slate-400">
                      <tr>
                        <th className="pb-2">Path</th>
                        <th className="pb-2">Type</th>
                        <th className="pb-2">Value</th>
                        <th className="pb-2">Copy</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRows.map((row) => (
                        <tr key={row.path} className="border-t border-slate-800/60 align-top">
                          <td className="py-1 pr-2 font-mono text-cyan-200">{highlightText(row.path, query)}</td>
                          <td className="py-1 pr-2 text-slate-400">{row.type}</td>
                          <td className="py-1">{highlightText(row.value, query)}</td>
                          <td className="py-1">
                            <button
                              type="button"
                              className="rounded border border-slate-700 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-slate-300 transition hover:border-cyan-400/60"
                              onClick={() => void navigator.clipboard.writeText(row.path)}
                            >
                              Path
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-slate-400">Valid JSON is required for table view.</p>
              )
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export const EditorOutput = memo(EditorOutputBase);
