import dynamic from "next/dynamic";

const EditorPage = dynamic(
  () => import("@/components/editor/editor-page").then((mod) => mod.EditorPage),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-xl border border-border bg-card p-6 text-muted-foreground">
        Loading editor workspace...
      </div>
    ),
  }
);

export default function EditorRoute() {
  return <EditorPage />;
}
