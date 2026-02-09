import type { MetadataRoute } from "next";
import { publicEnv } from "@/lib/public-env";

const baseUrl = publicEnv.siteUrl;

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
