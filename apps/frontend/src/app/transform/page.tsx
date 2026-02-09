import dynamic from "next/dynamic";

const TransformPage = dynamic(
  () => import("@/components/transform/transform-page").then((mod) => mod.TransformPage),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-3xl border border-slate-800/70 bg-slate-950/50 p-6 text-slate-300">
        Loading transformation studio...
      </div>
    ),
  }
);

export default function TransformRoute() {
  return <TransformPage />;
}
