"use client";

import { motion } from "framer-motion";
import { Base64Tool } from "@/components/tools/base64-tool";
import { FakeDataTool } from "@/components/tools/fake-data-tool";
import { HashTool } from "@/components/tools/hash-tool";
import { JsonDiffTool } from "@/components/tools/json-diff-tool";
import { JwtTool } from "@/components/tools/jwt-tool";
import { RegexTool } from "@/components/tools/regex-tool";
import { TimestampTool } from "@/components/tools/timestamp-tool";
import { UuidTool } from "@/components/tools/uuid-tool";

export function ToolsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200">
            Tools Vault
          </p>
          <h1 className="text-3xl font-semibold text-white">
            Developer utilities, unified
          </h1>
          <p className="text-sm text-slate-400">
            Premium utilities for testing, inspecting, and accelerating JSON workflows.
          </p>
        </div>
        <motion.div
          className="rounded-3xl border border-slate-800/70 bg-slate-950/60 px-6 py-4 text-sm text-slate-300 shadow-lg"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
            Active stack
          </p>
          <p className="text-lg font-semibold text-white">JWT · Base64 · Diff</p>
          <p className="text-xs text-slate-500">All tools run locally in your browser.</p>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <JwtTool />
        <Base64Tool />
        <UuidTool />
        <RegexTool />
        <HashTool />
        <FakeDataTool />
        <JsonDiffTool />
        <TimestampTool />
      </div>
    </div>
  );
}
