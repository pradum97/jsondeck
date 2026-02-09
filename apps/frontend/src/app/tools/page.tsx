import dynamic from "next/dynamic";

const ToolsPage = dynamic(
  () => import("@/components/tools/tools-page").then((mod) => mod.ToolsPage),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-3xl border border-slate-800/70 bg-slate-950/50 p-6 text-slate-300">
        Loading tools vault...
      </div>
    ),
  }
);

export default function ToolsRoute() {
  return <ToolsPage />;
}
