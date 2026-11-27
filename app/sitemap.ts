import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: "https://www.tftdle.com", lastModified: new Date(), changeFrequency: "daily", priority: 1 }];
}
