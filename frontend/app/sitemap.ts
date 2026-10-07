import type { MetadataRoute } from "next";
import { API_URL, SITE_URL } from "@/lib/site";

export const revalidate = 3600; // refresh the product list hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const pages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/products`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  try {
    const res = await fetch(`${API_URL}/products?limit=1000&page=1`, { next: { revalidate } });
    if (res.ok) {
      const { products = [] } = await res.json();
      for (const p of products) {
        if (!p?.slug) continue;
        pages.push({
          url: `${SITE_URL}/products/${p.slug}`,
          lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
    }
  } catch {
    // API unavailable: still serve the main pages
  }

  return pages;
}
