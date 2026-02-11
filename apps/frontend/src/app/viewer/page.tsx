import dynamic from "next/dynamic";

const EditorPage = dynamic(
  () => import("@/components/editor/editor-page").then((mod) => mod.EditorPage),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-3xl border border-slate-800/70 bg-slate-950/50 p-6 text-slate-300">
        Loading viewer workspace...
      </div>
    ),
  }
);

export default function ViewerRoute() {
  return <EditorPage />;
}
