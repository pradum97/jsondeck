import dynamic from "next/dynamic";
import type { Metadata } from "next";

const EditorPage = dynamic(
  () => import("@/components/editor/editor-page").then((mod) => mod.EditorPage),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-3xl border border-slate-800/70 bg-slate-950/50 p-6 text-slate-300">
        Loading validator workspace...
      </div>
    ),
  }
);

export const metadata: Metadata = {
  title: "JSON Validator | JsonDeck",
  description:
    "Validate JSON syntax, surface errors, and keep structured diffs for production payloads.",
  alternates: {
    canonical: "/json-validator",
  },
};

export default function JsonValidatorPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
          JSON Validator
        </p>
        <h1 className="text-3xl font-semibold text-white">
          Validate and debug JSON with confidence
        </h1>
        <p className="text-sm text-slate-400">
          Catch JSON errors early with live diagnostics, formatting, and minify
          tools in one workspace.
        </p>
      </section>
      <EditorPage />
    </main>
  );
}
