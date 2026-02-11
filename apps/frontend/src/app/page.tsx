import dynamic from "next/dynamic";

const EditorPage = dynamic(
  () => import("@/components/editor/editor-page").then((mod) => mod.EditorPage),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[60vh] rounded-xl border border-border bg-card p-6 text-muted-foreground">
        Loading editor workspace...
      </div>
    ),
  }
);

export default function HomePage() {
  return <EditorPage />;
}
