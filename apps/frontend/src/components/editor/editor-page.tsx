"use client";

import axios from "axios";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useMutation } from "@tanstack/react-query";
import type { editor } from "monaco-editor";
import type * as MonacoNamespace from "monaco-editor";
import { requestTransform, type TransformOperation } from "@/lib/transform-service";
import { useEditorStore } from "@/store/editor-store";
import { EditorTabs } from "@/components/editor/editor-tabs";
import { EditorToolbar } from "@/components/editor/editor-toolbar";
import { EditorOutput } from "@/components/editor/editor-output";
import { useJsonWorker } from "@/hooks/useJson-worker";
import { cn } from "@/lib/utils";
import type { JsonDiagnostic, JsonDiagnosticStatus } from "@/lib/json-tools";

const STORAGE_KEY = "jsondeck.editor.tabs.v1";
const REMOTE_TRANSFORM_THRESHOLD = 1200;

type JsonErrorLocation = {
  message: string;
  line: number;
  column: number;
};

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center rounded-xl border border-border bg-card text-xs text-muted">
      Loading editor...
    </div>
  ),
});

function getLineAndColumnFromIndex(text: string, index: number) {
  let line = 1;
  let column = 1;

  for (let i = 0; i < index; i += 1) {
    if (text[i] === "\n") {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }
  }

  return { line, column };
}

function parseJsonError(input: string): JsonErrorLocation | null {
  try {
    JSON.parse(input);
    return null;
  } catch (error) {
    if (!(error instanceof SyntaxError)) {
      return null;
    }

    const message = error.message;
    const lineColMatch = message.match(/line\s+(\d+)\s+column\s+(\d+)/i);
    if (lineColMatch) {
      const line = Number.parseInt(lineColMatch[1], 10);
      const column = Number.parseInt(lineColMatch[2], 10);
      return { message, line, column };
    }

    const positionMatch = message.match(/position\s+(\d+)/i);
    if (positionMatch) {
      const pos = Number.parseInt(positionMatch[1], 10);
      const { line, column } = getLineAndColumnFromIndex(input, Number.isNaN(pos) ? 0 : pos);
      return { message, line, column };
    }

    return { message, line: 1, column: 1 };
  }
}

export function EditorPage() {
  const pathname = usePathname();
  const { tabs, activeTabId, updateTabContent, addTab, setDiagnostics, setOutput, addHistory, hydrate, markSaved } = useEditorStore();
  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [apiUrl, setApiUrl] = useState("");
  const [editorInstance, setEditorInstance] = useState<editor.IStandaloneCodeEditor | null>(null);
  const { format, minify } = useJsonWorker();
  const isViewerMode = pathname?.startsWith("/viewer") ?? false;

  const transformMutation = useMutation({
    mutationFn: async (payload: { input: string; operation: TransformOperation }) => requestTransform(payload.input, payload.operation),
  });

  const runLocalTransform = useCallback(async (operation: TransformOperation) => {
    const result = operation === "minify" ? await minify(activeTab.content) : await format(activeTab.content);
    setDiagnostics(result.diagnostic);
    setOutput(result.value);
    if (result.diagnostic.status === "valid") updateTabContent(activeTab.id, result.value);

    return {
      status: result.diagnostic.status as JsonDiagnosticStatus,
      value: result.value,
      message: result.diagnostic.message,
    };
  }, [activeTab.content, activeTab.id, format, minify, setDiagnostics, setOutput, updateTabContent]);

  const runTransform = useCallback(async (operation: TransformOperation) => {
    if (activeTab.content.length < REMOTE_TRANSFORM_THRESHOLD) return runLocalTransform(operation);

    try {
      const remote = await transformMutation.mutateAsync({ input: activeTab.content, operation });
      const diagnostics: JsonDiagnostic = { status: remote.status === "valid" ? "valid" : "error", message: remote.message };
      setDiagnostics(diagnostics);
      setOutput(remote.output);
      if (remote.status === "valid") updateTabContent(activeTab.id, remote.output);
      return { status: diagnostics.status, value: remote.output, message: remote.message };
    } catch {
      return runLocalTransform(operation);
    }
  }, [activeTab.content, activeTab.id, runLocalTransform, setDiagnostics, setOutput, transformMutation, updateTabContent]);

  const handleFormat = useCallback(async () => {
    const result = await runTransform("format");
    addHistory({ action: "Format", timestamp: new Date().toLocaleTimeString(), summary: result.status === "valid" ? "Formatted JSON successfully." : "Formatting failed due to invalid JSON." });
  }, [addHistory, runTransform]);

  const handleMinify = useCallback(async () => {
    const result = await runTransform("minify");
    addHistory({ action: "Minify", timestamp: new Date().toLocaleTimeString(), summary: result.status === "valid" ? "Minified JSON successfully." : "Minify failed due to invalid JSON." });
  }, [addHistory, runTransform]);

  const handleNewTab = useCallback(() => {
    addTab();
    addHistory({ action: "New Tab", timestamp: new Date().toLocaleTimeString(), summary: "Opened a fresh JSON workspace tab." });
  }, [addHistory, addTab]);

  const handlePaste = useCallback(async () => {
    const clipboard = await navigator.clipboard.readText();
    updateTabContent(activeTab.id, clipboard);
  }, [activeTab.id, updateTabContent]);

  const handleClear = useCallback(() => {
    updateTabContent(activeTab.id, "");
    setOutput("");
  }, [activeTab.id, setOutput, updateTabContent]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(activeTab.content);
  }, [activeTab.content]);

  const handleStringify = useCallback(() => {
    try {
      const parsed = JSON.parse(activeTab.content) as unknown;
      const stringified = JSON.stringify(parsed);
      updateTabContent(activeTab.id, stringified);
      setDiagnostics({ status: "valid", message: "JSON stringified." });
    } catch {
      setDiagnostics({ status: "error", message: "Invalid JSON. Unable to stringify." });
    }
  }, [activeTab.content, activeTab.id, setDiagnostics, updateTabContent]);

  const handleLoadJson = useCallback(async () => {
    const response = await axios.get(apiUrl.trim(), { responseType: "json" });
    const payload = JSON.stringify(response.data, null, 2);
    updateTabContent(activeTab.id, payload);
    setOutput(payload);
    setShowLoadModal(false);
    setApiUrl("");
  }, [activeTab.id, apiUrl, setOutput, updateTabContent]);

  useHotkeys("ctrl+shift+f", handleFormat, { preventDefault: true }, [handleFormat]);
  useHotkeys("ctrl+shift+m", handleMinify, { preventDefault: true }, [handleMinify]);
  useHotkeys("ctrl+alt+n", handleNewTab, { preventDefault: true }, [handleNewTab]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as { tabs: typeof tabs; activeTabId: string };
      if (parsed.tabs?.length) hydrate(parsed.tabs, parsed.activeTabId ?? parsed.tabs[0].id);
    } catch {
      // Ignore storage errors.
    }
  }, [hydrate]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ tabs, activeTabId }));
      const timestamp = new Date().toLocaleTimeString();
      markSaved(activeTabId, timestamp);
    }, 900);
    return () => window.clearTimeout(timeout);
  }, [tabs, activeTabId, markSaved]);

  useEffect(() => {
    document.body.style.overflow = showLoadModal ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showLoadModal]);

  const parseError = useMemo(() => {
    if (!activeTab.content.trim()) return null;
    return parseJsonError(activeTab.content);
  }, [activeTab.content]);

  useEffect(() => {
    if (activeTab.content.trim() === "") {
      setDiagnostics({ status: "idle", message: "Ready to validate." });
    }
  }, [activeTab.content, setDiagnostics]);

  const jumpToError = useCallback(() => {
    if (!parseError || !editorInstance) return;
    editorInstance.revealPositionInCenter({ lineNumber: parseError.line, column: parseError.column });
    editorInstance.setPosition({ lineNumber: parseError.line, column: parseError.column });
    editorInstance.focus();
  }, [editorInstance, parseError]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-slate-200 bg-card p-2 shadow-sm dark:border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto pb-3">
          <EditorTabs onAddTab={handleNewTab} />
        </div>

        <div className="pt-3">
          <EditorToolbar onFormat={handleFormat} onMinify={handleMinify} onPaste={() => void handlePaste()} onClear={handleClear} onCopy={() => void handleCopy()} onStringify={handleStringify} onLoadJson={() => setShowLoadModal(true)} />
        </div>

        <div className="pt-3">
          {parseError ? (
            <motion.button
              type="button"
              onClick={jumpToError}
              initial={{ y: -14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -14, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="w-full rounded-lg border border-error bg-error/10 px-3 py-1.5 text-left text-xs text-error"
            >
              Invalid JSON at line {parseError.line} column {parseError.column} — {parseError.message}
            </motion.button>
          ) : null}
        </div>

        <div className="relative flex-1 min-h-0 pt-3">
          <div className={cn("absolute inset-0 rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#0b1220]", isViewerMode ? "hidden" : "block")}>
            <MonacoEditor
              height="100%"
              width="100%"
              defaultLanguage="json"
              theme="vs-dark"
              value={activeTab.content}
              beforeMount={(monaco: typeof MonacoNamespace) => {
                monaco.editor.defineTheme("vs-dark", {
                  base: "vs-dark",
                  inherit: true,
                  rules: [],
                  colors: {
                    "editor.background": "#0b1220",
                    "editorLineNumber.foreground": "#475569",
                    "editorLineNumber.activeForeground": "#cbd5e1",
                  },
                });
              }}
              onMount={(instance) => setEditorInstance(instance)}
              onChange={(nextValue) => updateTabContent(activeTab.id, nextValue ?? "")}
              options={{
                minimap: { enabled: false },
                fontSize: 16,
                lineHeight: 22,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                smoothScrolling: true,
                cursorBlinking: "smooth",
                padding: { top: 10, bottom: 10 },
              }}
            />
          </div>

          <div className={cn("absolute inset-0", isViewerMode ? "block" : "hidden")}>
            <EditorOutput formatted={activeTab.content} />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showLoadModal ? (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 p-4 backdrop-blur-sm dark:bg-card/90" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ y: 18, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 12, opacity: 0, scale: 0.98 }} transition={{ duration: 0.2 }} className="w-full max-w-lg rounded-2xl border border-slate-200 bg-card p-5 shadow-sm dark:border-slate-800">
              <h2 className="text-base font-semibold text-text">Load JSON from API URL</h2>
              <input
                value={apiUrl}
                onChange={(event) => setApiUrl(event.target.value)}
                placeholder="https://api.example.com/data"
                className="mt-3 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 dark:border-border dark:bg-card dark:text-secondary"
              />
              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setShowLoadModal(false)} className="h-9 rounded-lg border border-slate-300 bg-white px-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 dark:border-border dark:bg-transparent dark:text-secondary">Cancel</button>
                <button type="button" onClick={() => void handleLoadJson()} className="h-9 rounded-lg bg-blue-600 px-4 text-xs font-semibold uppercase tracking-[0.16em] text-white hover:bg-blue-700 dark:bg-accent-soft dark:text-accent dark:hover:bg-accent-soft">Load</button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
