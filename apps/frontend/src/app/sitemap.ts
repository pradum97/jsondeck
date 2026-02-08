import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jsondeck.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/editor",
    "/transform",
    "/tools",
    "/api-tester",
    "/dashboard",
    "/settings",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
