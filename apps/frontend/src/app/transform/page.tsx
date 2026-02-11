import dynamic from "next/dynamic";

const TransformPage = dynamic(
  () => import("@/components/transform/transform-page").then((mod) => mod.TransformPage),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-xl border border-border bg-card p-6 text-muted-foreground">
        Loading transformation studio...
      </div>
    ),
  }
);

export default function TransformRoute() {
  return <TransformPage />;
}
