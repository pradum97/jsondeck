"use client";

import dynamic from "next/dynamic";

const JwtTool = dynamic(() => import("@/components/tools/jwt-tool").then((mod) => mod.JwtTool));
const Base64Tool = dynamic(() => import("@/components/tools/base64-tool").then((mod) => mod.Base64Tool));
const UuidTool = dynamic(() => import("@/components/tools/uuid-tool").then((mod) => mod.UuidTool));
const RegexTool = dynamic(() => import("@/components/tools/regex-tool").then((mod) => mod.RegexTool));
const HashTool = dynamic(() => import("@/components/tools/hash-tool").then((mod) => mod.HashTool));
const JsonDiffTool = dynamic(() => import("@/components/tools/json-diff-tool").then((mod) => mod.JsonDiffTool));
const TimestampTool = dynamic(() => import("@/components/tools/timestamp-tool").then((mod) => mod.TimestampTool));

export function ToolsPage() {
  return (
    <div className="flex min-h-[calc(100vh-var(--navbar-height)-3.25rem)] flex-1 flex-col gap-3">
      <div className="rounded-xl border border-border bg-card px-4 py-3">
        <h1 className="text-lg font-semibold text-foreground">Developer Tools</h1>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <JwtTool />
        <Base64Tool />
        <UuidTool />
        <RegexTool />
        <HashTool />
        <JsonDiffTool />
        <TimestampTool />
      </div>
    </div>
  );
}
