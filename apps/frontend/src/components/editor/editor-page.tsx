"use client";

import axios from "axios";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useHotkeys } from "react-hotkeys-hook";
import { useMutation } from "@tanstack/react-query";
import { requestTransform, type TransformOperation } from "@/lib/transform-service";
import { useEditorStore } from "@/store/editor-store";
import { EditorTabs } from "@/components/editor/editor-tabs";
import { EditorToolbar } from "@/components/editor/editor-toolbar";
import { EditorOutput } from "@/components/editor/editor-output";
import { EditorSnippets } from "@/components/editor/editor-snippets";
import { EditorHistory } from "@/components/editor/editor-history";
import { ResizableSplit } from "@/components/editor/resizable-split";
import { cn } from "@/lib/utils";
import { useJsonWorker } from "@/hooks/useJson-worker";
import type { JsonDiagnostic, JsonDiagnosticStatus, JsonTransformResult } from "@/lib/json-tools";

const STORAGE_KEY = "jsondeck.editor.tabs.v1";
const REMOTE_TRANSFORM_THRESHOLD = 1200;

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center rounded-2xl border border-slate-800/80 bg-slate-950/70 text-xs text-slate-500">
      Loading editor...
    </div>
  ),
});

export function EditorPage() {
  const {
    tabs,
    activeTabId,
    updateTabContent,
    addTab,
    setDiagnostics,
    setOutput,
    addHistory,
    splitRatio,
    setSplitRatio,
    hydrate,
    markSaved,
  } = useEditorStore();
  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];
  const [lastSavedLabel, setLastSavedLabel] = useState("Autosave idle");
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [apiUrl, setApiUrl] = useState("");
  const { format, minify } = useJsonWorker();
  const [formattedPreview, setFormattedPreview] = useState<JsonTransformResult>({
    value: activeTab.content,
    diagnostic: { status: "idle", message: "Formatting preview loading..." },
  });

  const transformMutation = useMutation({
    mutationFn: async (payload: { input: string; operation: TransformOperation }) =>
      requestTransform(payload.input, payload.operation),
  });

  useEffect(() => {
    let cancelled = false;

    const runPreview = async () => {
      const nextFormatted = await format(activeTab.content);
      if (!cancelled) {
        setFormattedPreview(nextFormatted);
      }
    };

    runPreview();

    return () => {
      cancelled = true;
    };
  }, [activeTab.content, format]);

  const runLocalTransform = useCallback(async (operation: TransformOperation) => {
    const result = operation === "minify" ? await minify(activeTab.content) : await format(activeTab.content);

    setDiagnostics(result.diagnostic);
    setOutput(result.value);
    if (result.diagnostic.status === "valid") {
      updateTabContent(activeTab.id, result.value);
    }

    return {
      status: result.diagnostic.status as JsonDiagnosticStatus,
      value: result.value,
      message: result.diagnostic.message,
    };
  }, [activeTab.content, activeTab.id, format, minify, setDiagnostics, setOutput, updateTabContent]);

  const runTransform = useCallback(async (operation: TransformOperation) => {
    if (activeTab.content.length < REMOTE_TRANSFORM_THRESHOLD) {
      return runLocalTransform(operation);
    }

    try {
      const remote = await transformMutation.mutateAsync({
        input: activeTab.content,
        operation,
      });
      const diagnostics: JsonDiagnostic = {
        status: remote.status === "valid" ? "valid" : "error",
        message: remote.message,
      };
      setDiagnostics(diagnostics);
      setOutput(remote.output);
      if (remote.status === "valid") {
        updateTabContent(activeTab.id, remote.output);
      }
      return { status: diagnostics.status, value: remote.output, message: remote.message };
    } catch {
      return runLocalTransform(operation);
    }
  }, [activeTab.content, activeTab.id, runLocalTransform, setDiagnostics, setOutput, transformMutation, updateTabContent]);

  const handleFormat = useCallback(async () => {
    const result = await runTransform("format");
    addHistory({
      action: "Format",
      timestamp: new Date().toLocaleTimeString(),
      summary: result.status === "valid" ? "Formatted JSON successfully." : "Formatting failed due to invalid JSON.",
    });
  }, [addHistory, runTransform]);

  const handleMinify = useCallback(async () => {
    const result = await runTransform("minify");
    addHistory({
      action: "Minify",
      timestamp: new Date().toLocaleTimeString(),
      summary: result.status === "valid" ? "Minified JSON successfully." : "Minify failed due to invalid JSON.",
    });
  }, [addHistory, runTransform]);

  const handleNewTab = useCallback(() => {
    addTab();
    addHistory({
      action: "New Tab",
      timestamp: new Date().toLocaleTimeString(),
      summary: "Opened a fresh JSON workspace tab.",
    });
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
      const parsed = JSON.parse(stored) as {
        tabs: typeof tabs;
        activeTabId: string;
      };
      if (parsed.tabs?.length) {
        hydrate(parsed.tabs, parsed.activeTabId ?? parsed.tabs[0].id);
      }
    } catch {
      // Ignore storage errors.
    }
  }, [hydrate]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ tabs, activeTabId }));
      const timestamp = new Date().toLocaleTimeString();
      markSaved(activeTabId, timestamp);
      setLastSavedLabel(`Autosaved at ${timestamp}`);
    }, 900);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [tabs, activeTabId, markSaved]);

  const stats = useMemo(() => {
    const lines = activeTab.content.split("\n").length;
    const characters = activeTab.content.length;
    return { lines, characters };
  }, [activeTab.content]);

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200">JSON Editor</p>
          <h1 className="text-2xl font-semibold text-white sm:text-3xl">Real-time JSON workspace</h1>
          <p className="text-sm text-slate-400">Format, minify, inspect, and ship production JSON faster.</p>
        </div>
        <motion.div
          className="w-full rounded-3xl border border-slate-800/70 bg-slate-950/60 px-4 py-3 text-sm text-slate-300 shadow-lg sm:w-auto sm:px-6 sm:py-4"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Workspace</p>
          <p className="text-lg font-semibold text-white">{activeTab.name}</p>
          <p className="text-xs text-slate-500">{lastSavedLabel}</p>
        </motion.div>
      </div>

      <EditorToolbar
        onFormat={handleFormat}
        onMinify={handleMinify}
        onPaste={() => void handlePaste()}
        onClear={handleClear}
        onCopy={() => void handleCopy()}
        onStringify={handleStringify}
        onLoadJson={() => setShowLoadModal(true)}
        onNewTab={handleNewTab}
      />

      <div className="rounded-3xl border border-slate-800/70 bg-slate-950/50 p-3 sm:p-4">
        <EditorTabs />
        <div className="mt-3 h-[62vh] min-h-[340px] rounded-3xl border border-slate-800/70 bg-slate-950/70 p-2 sm:h-[520px] sm:p-3">
          <ResizableSplit
            initialRatio={splitRatio}
            onRatioChange={setSplitRatio}
            left={
              <div className="flex h-full min-w-0 flex-col gap-3 pr-2">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-slate-500">
                  <span>Editor</span>
                  <span>{stats.lines} lines · {stats.characters} chars</span>
                </div>
                <div className="h-full overflow-hidden rounded-2xl border border-slate-800/70">
                  <MonacoEditor
                    height="100%"
                    defaultLanguage="json"
                    theme="vs-dark"
                    value={activeTab.content}
                    onChange={(nextValue) => updateTabContent(activeTab.id, nextValue ?? "")}
                    options={{ minimap: { enabled: false }, fontSize: 14, scrollBeyondLastLine: false, automaticLayout: true }}
                  />
                </div>
              </div>
            }
            right={
              <div className="flex h-full min-w-0 flex-col gap-3 pl-2">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-slate-500">
                  <span>Output</span>
                  <span className={cn("text-cyan-300")}>{formattedPreview.diagnostic.status === "valid" ? "Ready" : "Needs attention"}</span>
                </div>
                <EditorOutput formatted={formattedPreview.value} />
              </div>
            }
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <EditorSnippets onInsert={(payload) => updateTabContent(activeTab.id, payload)} />
        <EditorHistory />
      </div>

      {showLoadModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="w-full max-w-lg rounded-3xl border border-slate-700/80 bg-slate-900/95 p-5">
            <h2 className="text-lg font-semibold text-white">Load JSON from API URL</h2>
            <p className="mt-1 text-sm text-slate-400">Enter an endpoint that returns JSON.</p>
            <input
              value={apiUrl}
              onChange={(event) => setApiUrl(event.target.value)}
              placeholder="https://api.example.com/data"
              className="mt-4 h-11 w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 text-sm text-slate-200"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setShowLoadModal(false)} className="h-10 rounded-xl border border-slate-700 px-4 text-xs uppercase tracking-[0.2em] text-slate-300">Cancel</button>
              <button type="button" onClick={() => void handleLoadJson()} className="h-10 rounded-xl bg-cyan-500/25 px-4 text-xs uppercase tracking-[0.2em] text-cyan-100">Load</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
