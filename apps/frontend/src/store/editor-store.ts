import { create } from "zustand";

export type EditorTab = {
  id: string;
  name: string;
  content: string;
  language: "json";
  isDirty: boolean;
  lastSavedAt?: string;
};

export type EditorHistoryEntry = {
  id: string;
  action: string;
  timestamp: string;
  summary: string;
};

export type EditorDiagnostics = {
  status: "idle" | "valid" | "error";
  message: string;
};

export type EditorState = {
  tabs: EditorTab[];
  activeTabId: string;
  diagnostics: EditorDiagnostics;
  output: string;
  diffView: boolean;
  splitRatio: number;
  history: EditorHistoryEntry[];
  setActiveTab: (tabId: string) => void;
  addTab: (name?: string) => void;
  closeTab: (tabId: string) => void;
  updateTabContent: (tabId: string, content: string) => void;
  setOutput: (output: string) => void;
  setDiagnostics: (diagnostics: EditorDiagnostics) => void;
  toggleDiffView: () => void;
  setSplitRatio: (ratio: number) => void;
  addHistory: (entry: Omit<EditorHistoryEntry, "id">) => void;
  hydrate: (tabs: EditorTab[], activeTabId: string) => void;
  markSaved: (tabId: string, timestamp: string) => void;
};

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `tab-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const initialTab: EditorTab = {
  id: createId(),
  name: "request.json",
  content: `{
  "workspace": "JSONDeck",
  "project": "editor",
  "status": "ready",
  "features": ["format", "minify", "validate", "diff"]
}`,
  language: "json",
  isDirty: false,
  lastSavedAt: undefined,
};

export const useEditorStore = create<EditorState>((set, get) => ({
  tabs: [initialTab],
  activeTabId: initialTab.id,
  diagnostics: { status: "idle", message: "Ready to validate." },
  output: "",
  diffView: false,
  splitRatio: 0.58,
  history: [],
  setActiveTab: (tabId) => set({ activeTabId: tabId }),
  addTab: (name) => {
    const newTab: EditorTab = {
      id: createId(),
      name: name ?? `untitled-${get().tabs.length + 1}.json`,
      content: "{\n  \n}",
      language: "json",
      isDirty: true,
      lastSavedAt: undefined,
    };
    set((state) => ({
      tabs: [...state.tabs, newTab],
      activeTabId: newTab.id,
    }));
  },
  closeTab: (tabId) => {
    const remainingTabs = get().tabs.filter((tab) => tab.id !== tabId);
    if (remainingTabs.length === 0) {
      set({ tabs: [initialTab], activeTabId: initialTab.id });
      return;
    }
    const nextActive =
      get().activeTabId === tabId ? remainingTabs[0].id : get().activeTabId;
    set({ tabs: remainingTabs, activeTabId: nextActive });
  },
  updateTabContent: (tabId, content) =>
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === tabId ? { ...tab, content, isDirty: true } : tab
      ),
    })),
  setOutput: (output) => set({ output }),
  setDiagnostics: (diagnostics) => set({ diagnostics }),
  toggleDiffView: () => set((state) => ({ diffView: !state.diffView })),
  setSplitRatio: (ratio) => set({ splitRatio: ratio }),
  addHistory: (entry) =>
    set((state) => ({
      history: [
        { id: createId(), ...entry },
        ...state.history.slice(0, 19),
      ],
    })),
  hydrate: (tabs, activeTabId) =>
    set({
      tabs,
      activeTabId,
    }),
  markSaved: (tabId, timestamp) =>
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === tabId
          ? { ...tab, isDirty: false, lastSavedAt: timestamp }
          : tab
      ),
    })),
}));
