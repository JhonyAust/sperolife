import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Private pages (wishlist, checkout, account, orders) are not blocked here on purpose:
// they carry a "noindex" tag, which Google can only see if it may crawl them.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin/"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
