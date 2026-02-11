"use client";

import { useMemo } from "react";
import { EditorOutput } from "@/components/editor/editor-output";
import { useEditorStore } from "@/store/editor-store";

export function ViewerPage() {
  const tabs = useEditorStore((state) => state.tabs);
  const activeTabId = useEditorStore((state) => state.activeTabId);
  const activeTab = useMemo(() => tabs.find((tab) => tab.id === activeTabId) ?? tabs[0], [activeTabId, tabs]);

  return (
    <div className="h-full min-h-[65vh]">
      <EditorOutput formatted={activeTab.content} />
    </div>
  );
}
