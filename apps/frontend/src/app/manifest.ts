import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "JSONDeck",
    short_name: "JSONDeck",
    description: "JSONDeck: VSCode-grade JSON editor, API tester, and developer tools suite.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0f1a",
    theme_color: "#0b0f1a",
    icons: [
      {
        src: "/manifest-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/manifest-maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
