import dynamic from "next/dynamic";
import type { Metadata } from "next";

const Base64Tool = dynamic(
  () => import("@/components/tools/base64-tool").then((mod) => mod.Base64Tool),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-3xl border border-slate-800/70 bg-slate-950/50 p-6 text-slate-300">
        Loading Base64 decoder...
      </div>
    ),
  }
);

export const metadata: Metadata = {
  title: "Base64 Decode | JsonDeck",
  description:
    "Decode and encode Base64 payloads with instant previews and safe handling.",
  alternates: {
    canonical: "/base64-decode",
  },
};

export default function Base64DecodePage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
          Base64 Decode
        </p>
        <h1 className="text-3xl font-semibold text-white">
          Decode Base64 payloads safely
        </h1>
        <p className="text-sm text-slate-400">
          Inspect tokens, headers, and payloads with instant Base64 decoding for
          production workflows.
        </p>
      </section>
      <Base64Tool />
    </main>
  );
}
