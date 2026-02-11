import dynamic from "next/dynamic";

const ViewerPage = dynamic(
  () => import("@/components/editor/viewer-page").then((mod) => mod.ViewerPage),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-xl border border-border bg-card p-6 text-muted-foreground">
        Loading viewer workspace...
      </div>
    ),
  }
);

export default function ViewerRoute() {
  return <ViewerPage />;
}
