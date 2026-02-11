import dynamic from "next/dynamic";

const ToolsPage = dynamic(
  () => import("@/components/tools/tools-page").then((mod) => mod.ToolsPage),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-xl border border-border bg-card p-6 text-muted-foreground">
        Loading tools vault...
      </div>
    ),
  }
);

export default function ToolsRoute() {
  return <ToolsPage />;
}
