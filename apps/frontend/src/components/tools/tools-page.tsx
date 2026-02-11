"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const JwtTool = dynamic(() => import("@/components/tools/jwt-tool").then((mod) => mod.JwtTool));
const Base64Tool = dynamic(() => import("@/components/tools/base64-tool").then((mod) => mod.Base64Tool));
const UuidTool = dynamic(() => import("@/components/tools/uuid-tool").then((mod) => mod.UuidTool));
const RegexTool = dynamic(() => import("@/components/tools/regex-tool").then((mod) => mod.RegexTool));
const HashTool = dynamic(() => import("@/components/tools/hash-tool").then((mod) => mod.HashTool));
const JsonDiffTool = dynamic(() => import("@/components/tools/json-diff-tool").then((mod) => mod.JsonDiffTool));
const TimestampTool = dynamic(() => import("@/components/tools/timestamp-tool").then((mod) => mod.TimestampTool));

export function ToolsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent">
            Tools Vault
          </p>
          <h1 className="text-3xl font-semibold text-text">
            Developer utilities, unified
          </h1>
          <p className="text-sm text-muted">
            Premium utilities for testing, inspecting, and accelerating JSON workflows.
          </p>
        </div>
        <motion.div
          className="rounded-3xl border border-border bg-card px-6 py-4 text-sm text-secondary shadow-lg"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-xs uppercase tracking-[0.28em] text-muted">
            Active stack
          </p>
          <p className="text-lg font-semibold text-text">JWT · Base64 · Diff</p>
          <p className="text-xs text-muted">All tools run locally in your browser.</p>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
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
