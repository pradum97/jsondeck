import dynamic from "next/dynamic";
import type { Metadata } from "next";

const EditorPage = dynamic(
  () => import("@/components/editor/editor-page").then((mod) => mod.EditorPage),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-3xl border border-slate-800/70 bg-slate-950/50 p-6 text-slate-300">
        Loading formatter workspace...
      </div>
    ),
  }
);

export const metadata: Metadata = {
  title: "JSON Formatter | JsonDeck",
  description:
    "Format and beautify JSON instantly with live validation and diff preview.",
  alternates: {
    canonical: "/json-formatter",
  },
};

export default function JsonFormatterPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
          JSON Formatter
        </p>
        <h1 className="text-3xl font-semibold text-white">
          Beautify JSON with enterprise-ready tooling
        </h1>
        <p className="text-sm text-slate-400">
          Paste JSON, format instantly, and keep a full change history with safe
          offline-ready caching.
        </p>
      </section>
      <EditorPage />
    </main>
  );
}
