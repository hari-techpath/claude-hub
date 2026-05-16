import { MetadataRoute } from "next";
import { RESOURCES } from "@/lib/resources";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://claude-hub-three.vercel.app";
  const resources = RESOURCES.map((r) => ({
    url: `${base}/resources/${r.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: r.featured ? 0.9 : 0.7,
  }));
  return [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/explore`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/stacks`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/submit`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    ...resources,
  ];
}
