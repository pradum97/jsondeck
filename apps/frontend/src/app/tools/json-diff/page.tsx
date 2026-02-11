import dynamic from "next/dynamic";

const JsonDiffPage = dynamic(() => import("@/components/tools/json-diff-page").then((mod) => mod.JsonDiffPage), { ssr: false });

export default function JsonDiffRoute() {
  return <JsonDiffPage />;
}
