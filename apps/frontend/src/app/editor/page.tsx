import dynamic from "next/dynamic";

const EditorPage = dynamic(
  () => import("@/components/editor/editor-page").then((mod) => mod.EditorPage),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 text-[color:var(--muted)]">
        Loading editor workspace...
      </div>
    ),
  }
);

export default function EditorRoute() {
  return <EditorPage />;
}
