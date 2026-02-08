"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import type { OnMount } from "@monaco-editor/react";
import {
  loadEditorFromStorage,
  useEditorAutosave,
  useEditorStore,
} from "@/stores/editor-store";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center rounded-2xl border border-slate-800/80 bg-slate-950/70 text-xs text-slate-500">
      Loading editor...
    </div>
  ),
});

const HistoryPanel = dynamic(
  () => import("./history-panel").then((mod) => mod.HistoryPanel),
  { ssr: false }
);

const SnippetsPanel = dynamic(
  () => import("./snippets-panel").then((mod) => mod.SnippetsPanel),
  { ssr: false }
);

export function SplitLayout() {
  const tabs = useEditorStore((state) => state.tabs);
  const activeTab = useEditorStore((state) => state.activeTab);
  const content = useEditorStore((state) => state.content);
  const validation = useEditorStore((state) => state.validation);
  const isFullscreen = useEditorStore((state) => state.isFullscreen);
  const setActiveTab = useEditorStore((state) => state.setActiveTab);
  const updateContent = useEditorStore((state) => state.updateContent);
  const addTab = useEditorStore((state) => state.addTab);
  const closeTab = useEditorStore((state) => state.closeTab);
  const formatActiveTab = useEditorStore((state) => state.formatActiveTab);
  const minifyActiveTab = useEditorStore((state) => state.minifyActiveTab);
  const validateActiveTab = useEditorStore((state) => state.validateActiveTab);
  const toggleFullscreen = useEditorStore((state) => state.toggleFullscreen);
  const [ratio, setRatio] = useState(0.7);

  useEditorAutosave();

  useEffect(() => {
    loadEditorFromStorage();
  }, []);

  const activeTabMeta = useMemo(
    () => tabs.find((tab) => tab.id === activeTab),
    [tabs, activeTab]
  );

  const handleMount: OnMount = (editor, monaco) => {
    editor.focus();

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      useEditorStore.getState().formatActiveTab();
    });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyN, () => {
      useEditorStore.getState().addTab();
    });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyW, () => {
      useEditorStore.getState().closeTab(useEditorStore.getState().activeTab);
    });
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyM,
      () => {
        useEditorStore.getState().minifyActiveTab();
      }
    );
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
      editor.getAction("actions.find")?.run();
    });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK, () => {
      editor.getAction("editor.action.quickCommand")?.run();
    });
  };

  return (
    <section
      className={`flex h-full flex-col gap-4 ${
        isFullscreen
          ? "fixed inset-0 z-50 bg-slate-950 p-6"
          : "relative"
      }`}
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => addTab()}
            className="rounded-full border border-slate-800/80 bg-slate-900/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200"
          >
            New tab
          </button>
          <button
            type="button"
            onClick={() => closeTab(activeTab)}
            className="rounded-full border border-slate-800/80 bg-slate-900/60 px-4 py-2 text-xs text-slate-300"
          >
            Close tab
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={formatActiveTab}
            className="rounded-full border border-slate-800/80 bg-slate-900/60 px-4 py-2 text-xs text-slate-300"
          >
            Format (Ctrl+S)
          </button>
          <button
            type="button"
            onClick={minifyActiveTab}
            className="rounded-full border border-slate-800/80 bg-slate-900/60 px-4 py-2 text-xs text-slate-300"
          >
            Minify (Ctrl+Shift+M)
          </button>
          <button
            type="button"
            onClick={validateActiveTab}
            className="rounded-full border border-slate-800/80 bg-slate-900/60 px-4 py-2 text-xs text-slate-300"
          >
            Validate
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="rounded-full border border-slate-800/80 bg-slate-900/60 px-4 py-2 text-xs text-slate-300"
          >
            {isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          </button>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
              tab.id === activeTab
                ? "border-cyan-400/70 bg-cyan-500/10 text-cyan-200"
                : "border-slate-800/80 bg-slate-900/50 text-slate-400"
            }`}
          >
            {tab.name}
            {tab.isDirty ? " *" : ""}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-400">
        <span>Status: {validation.status}</span>
        <span>{validation.message}</span>
        {activeTabMeta?.lastSavedAt ? (
          <span>
            Saved {new Date(activeTabMeta.lastSavedAt).toLocaleTimeString()}
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span>Split ratio</span>
        <input
          type="range"
          min={50}
          max={85}
          value={ratio * 100}
          onChange={(event) => setRatio(Number(event.target.value) / 100)}
          className="w-48 accent-cyan-400"
        />
      </div>

      <div
        className="grid flex-1 gap-4"
        style={{ gridTemplateColumns: `${ratio * 100}% ${(1 - ratio) * 100}%` }}
      >
        <div className="min-h-[420px]">
          <MonacoEditor
            height="100%"
            defaultLanguage="json"
            theme="vs-dark"
            value={content}
            onMount={handleMount}
            onChange={(value) => updateContent(value ?? "")}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>
        <div className="flex h-full flex-col gap-4">
          <HistoryPanel />
          <SnippetsPanel />
        </div>
      </div>
    </section>
  );
}
