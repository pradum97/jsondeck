import dynamic from "next/dynamic";

const ViewerPage = dynamic(() => import("@/components/editor/viewer-page").then((mod) => mod.ViewerPage), {
  ssr: false,
});

export default function ViewerRoute() {
  return <ViewerPage />;
}
