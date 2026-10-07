// Site-wide constants for SEO (titles, canonical URLs, sitemap)

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.sperolifebd.com").replace(/\/$/, "");
export const SITE_NAME = "SperoLife";
export const SITE_TAGLINE = "Style You Believe In";
export const SITE_TITLE = "SperoLife | Original Sneakers, Shirts & Accessories in Bangladesh";
export const SITE_DESCRIPTION =
  "Shop original Nike, Adidas, Vans and LV sneakers, shirts, shackets and accessories at SperoLife. Cash on delivery all over Bangladesh.";

// Backend API, for server-side lookups (page titles, sitemap)
export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/$/, "");
