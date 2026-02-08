import dynamic from "next/dynamic";
import type { Metadata } from "next";

const JwtTool = dynamic(
  () => import("@/components/tools/jwt-tool").then((mod) => mod.JwtTool),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-3xl border border-slate-800/70 bg-slate-950/50 p-6 text-slate-300">
        Loading JWT decoder...
      </div>
    ),
  }
);

export const metadata: Metadata = {
  title: "JWT Decoder | JsonDeck",
  description:
    "Decode JWT headers, payloads, and signatures with instant validation and previews.",
  alternates: {
    canonical: "/jwt-decoder",
  },
};

export default function JwtDecoderPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
          JWT Decoder
        </p>
        <h1 className="text-3xl font-semibold text-white">
          Inspect JWTs with confidence
        </h1>
        <p className="text-sm text-slate-400">
          Review claims, headers, and signatures without sending tokens to third
          parties.
        </p>
      </section>
      <JwtTool />
    </main>
  );
}
