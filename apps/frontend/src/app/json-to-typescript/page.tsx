import dynamic from "next/dynamic";
import type { Metadata } from "next";

const TransformPage = dynamic(
  () => import("@/components/transform/transform-page").then((mod) => mod.TransformPage),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-3xl border border-slate-800/70 bg-slate-950/50 p-6 text-slate-300">
        Loading TypeScript transformer...
      </div>
    ),
  }
);

export const metadata: Metadata = {
  title: "JSON to TypeScript | JsonDeck",
  description:
    "Convert JSON into TypeScript interfaces and types with production-ready formatting.",
  alternates: {
    canonical: "/json-to-typescript",
  },
};

export default function JsonToTypeScriptPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
          JSON to TypeScript
        </p>
        <h1 className="text-3xl font-semibold text-white">
          Generate TypeScript definitions from JSON instantly
        </h1>
        <p className="text-sm text-slate-400">
          Transform JSON payloads into strongly typed interfaces, schemas, and
          data models.
        </p>
      </section>
      <TransformPage />
    </main>
  );
}
