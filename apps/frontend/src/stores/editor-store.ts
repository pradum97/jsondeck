"use client";

import { useEffect, useRef } from "react";
import { create } from "zustand";

export type EditorTab = {
  id: string;
  name: string;
  content: string;
  isDirty: boolean;
  lastSavedAt?: string;
};

export type HistoryEntry = {
  id: string;
  action: string;
  timestamp: string;
  summary: string;
};

export type Snippet = {
  id: string;
  name: string;
  content: string;
};

export type ValidationStatus = {
  status: "idle" | "valid" | "error";
  message: string;
};

type EditorState = {
  tabs: EditorTab[];
  activeTab: string;
  content: string;
  history: HistoryEntry[];
  snippets: Snippet[];
  validation: ValidationStatus;
  isFullscreen: boolean;
  setActiveTab: (tabId: string) => void;
  updateContent: (content: string) => void;
  addTab: (name?: string) => void;
  closeTab: (tabId: string) => void;
  formatActiveTab: () => void;
  minifyActiveTab: () => void;
  validateActiveTab: () => void;
  addHistory: (entry: Omit<HistoryEntry, "id" | "timestamp">) => void;
  addSnippet: (snippet: Omit<Snippet, "id">) => void;
  insertSnippet: (snippetId: string) => void;
  toggleFullscreen: () => void;
  markSaved: (tabId: string) => void;
  hydrate: (state: PersistedEditorState) => void;
};

type PersistedEditorState = Pick<
  EditorState,
  "tabs" | "activeTab" | "content" | "history" | "snippets"
>;

const STORAGE_KEY = "jsondeck-editor-v3";

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const initialTabs: EditorTab[] = [
  {
    id: createId(),
    name: "welcome.json",
    content: `{
  "name": "JSONDeck",
  "status": "ready",
  "features": ["format", "minify", "validate"],
  "tabs": true
}`,
    isDirty: false,
  },
];

const initialSnippets: Snippet[] = [
  {
    id: createId(),
    name: "Empty object",
    content: "{\n  \n}",
  },
  {
    id: createId(),
    name: "Array of items",
    content: "[\n  {\n    \"id\": 1,\n    \"name\": \"Item\"\n  }\n]",
  },
];

const loadPersistedState = (): PersistedEditorState | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedEditorState;
    if (!parsed.tabs || !parsed.activeTab) return null;
    return parsed;
  } catch {
    return null;
  }
};

const createHistoryEntry = (
  entry: Omit<HistoryEntry, "id" | "timestamp">
): HistoryEntry => ({
  id: createId(),
  timestamp: new Date().toISOString(),
  ...entry,
});

const applyJsonTransform = (
  content: string,
  options: { pretty: boolean }
): { nextContent: string; message: string; status: ValidationStatus } => {
  try {
    const parsed = JSON.parse(content);
    const nextContent = JSON.stringify(parsed, null, options.pretty ? 2 : 0);
    return {
      nextContent,
      message: options.pretty ? "Formatted JSON" : "Minified JSON",
      status: { status: "valid", message: "JSON is valid." },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid JSON";
    return {
      nextContent: content,
      message: "Validation failed",
      status: { status: "error", message },
    };
  }
};

const initialPersisted = loadPersistedState();

export const useEditorStore = create<EditorState>((set, get) => {
  const baseTabs = initialPersisted?.tabs?.length
    ? initialPersisted.tabs
    : initialTabs;
  const activeTab =
    initialPersisted?.activeTab ?? baseTabs[0]?.id ?? createId();
  const content =
    initialPersisted?.content ??
    baseTabs.find((tab) => tab.id === activeTab)?.content ??
    "";

  return {
    tabs: baseTabs,
    activeTab,
    content,
    history: initialPersisted?.history ?? [],
    snippets: initialPersisted?.snippets ?? initialSnippets,
    validation: { status: "idle", message: "Ready" },
    isFullscreen: false,
    setActiveTab: (tabId) => {
      const tab = get().tabs.find((item) => item.id === tabId);
      if (!tab) return;
      set({ activeTab: tabId, content: tab.content });
    },
    updateContent: (contentValue) => {
      const { activeTab: currentTab, tabs } = get();
      const nextTabs = tabs.map((tab) =>
        tab.id === currentTab
          ? { ...tab, content: contentValue, isDirty: true }
          : tab
      );
      set({ tabs: nextTabs, content: contentValue });
    },
    addTab: (name) => {
      const newTab: EditorTab = {
        id: createId(),
        name: name ?? `untitled-${get().tabs.length + 1}.json`,
        content: "{\n  \n}",
        isDirty: true,
      };
      set((state) => ({
        tabs: [...state.tabs, newTab],
        activeTab: newTab.id,
        content: newTab.content,
      }));
    },
    closeTab: (tabId) => {
      const remaining = get().tabs.filter((tab) => tab.id !== tabId);
      if (remaining.length === 0) {
        set({
          tabs: initialTabs,
          activeTab: initialTabs[0].id,
          content: initialTabs[0].content,
        });
        return;
      }
      const nextActive =
        get().activeTab === tabId ? remaining[0].id : get().activeTab;
      const nextContent =
        remaining.find((tab) => tab.id === nextActive)?.content ?? "";
      set({ tabs: remaining, activeTab: nextActive, content: nextContent });
    },
    formatActiveTab: () => {
      const { nextContent, message, status } = applyJsonTransform(
        get().content,
        { pretty: true }
      );
      get().updateContent(nextContent);
      set({ validation: status });
      get().addHistory({ action: "Format", summary: message });
    },
    minifyActiveTab: () => {
      const { nextContent, message, status } = applyJsonTransform(
        get().content,
        { pretty: false }
      );
      get().updateContent(nextContent);
      set({ validation: status });
      get().addHistory({ action: "Minify", summary: message });
    },
    validateActiveTab: () => {
      const { status } = applyJsonTransform(get().content, { pretty: true });
      set({ validation: status });
      get().addHistory({ action: "Validate", summary: status.message });
    },
    addHistory: (entry) =>
      set((state) => ({
        history: [createHistoryEntry(entry), ...state.history].slice(0, 25),
      })),
    addSnippet: (snippet) =>
      set((state) => ({
        snippets: [{ id: createId(), ...snippet }, ...state.snippets].slice(
          0,
          15
        ),
      })),
    insertSnippet: (snippetId) => {
      const snippet = get().snippets.find((item) => item.id === snippetId);
      if (!snippet) return;
      const nextContent = `${get().content}\n${snippet.content}`.trim();
      get().updateContent(nextContent);
      get().addHistory({
        action: "Snippet",
        summary: `Inserted: ${snippet.name}`,
      });
    },
    toggleFullscreen: () =>
      set((state) => ({ isFullscreen: !state.isFullscreen })),
    markSaved: (tabId) =>
      set((state) => ({
        tabs: state.tabs.map((tab) =>
          tab.id === tabId
            ? { ...tab, isDirty: false, lastSavedAt: new Date().toISOString() }
            : tab
        ),
      })),
    hydrate: (state) =>
      set({
        tabs: state.tabs,
        activeTab: state.activeTab,
        content: state.content,
        history: state.history,
        snippets: state.snippets,
      }),
  };
});

const persistState = (state: PersistedEditorState) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const useEditorAutosave = () => {
  const activeTab = useEditorStore((state) => state.activeTab);
  const tabs = useEditorStore((state) => state.tabs);
  const content = useEditorStore((state) => state.content);
  const history = useEditorStore((state) => state.history);
  const snippets = useEditorStore((state) => state.snippets);
  const markSaved = useEditorStore((state) => state.markSaved);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      persistState({ tabs, activeTab, content, history, snippets });
      markSaved(activeTab);
    }, 500);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [activeTab, content, history, snippets, tabs, markSaved]);
};

export const loadEditorFromStorage = () => {
  const persisted = loadPersistedState();
  if (persisted) {
    useEditorStore.getState().hydrate(persisted);
  }
};
