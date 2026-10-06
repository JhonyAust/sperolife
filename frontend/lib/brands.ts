// Shared brand rules for the homepage brand sections and the admin brand-logo editor.

// Homepage brand sections are shown in this order; any other sneaker brand follows alphabetically.
// `aliases` are normalized spellings (see normalizeBrand) that belong to the same brand.
export const FEATURED_SNEAKER_BRANDS = [
  { key: "nike", label: "Nike", aliases: ["nike"] },
  { key: "adidas", label: "Adidas", aliases: ["adidas"] },
  { key: "vans", label: "Vans", aliases: ["vans"] },
  { key: "lv", label: "LV", aliases: ["lv", "louis vuitton", "louisvuitton"] },
];

export const UNBRANDED_KEY = "__unbranded__";

// "  Louis-Vuitton " -> "louis vuitton", "L.V." -> "lv" (same rules as the backend Brand model)
export const normalizeBrand = (brand?: string | null) =>
  (brand || "")
    .toLowerCase()
    .replace(/[.'’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

// Groups spellings of the same brand: "Louis Vuitton" and "L.V." both give "lv"
export const getBrandKey = (brand?: string | null) => {
  const normalized = normalizeBrand(brand);
  if (!normalized) return UNBRANDED_KEY;
  const featured = FEATURED_SNEAKER_BRANDS.find((b) => b.aliases.includes(normalized));
  return featured ? featured.key : normalized;
};

// Built-in logo key for a brand group, e.g. "new balance" -> "newbalance"
export const getLogoKey = (brandKey: string) =>
  brandKey === UNBRANDED_KEY ? null : String(brandKey).replace(/\s+/g, "");

// Admin-uploaded logos ({ name, logo }, newest first) -> { [brandKey]: logoUrl }
export const buildBrandLogoMap = (brands: { name: string; logo?: string | null }[] = []) => {
  const map: Record<string, string> = {};
  for (const b of brands) {
    const key = getBrandKey(b.name);
    if (b.logo && key !== UNBRANDED_KEY && !map[key]) map[key] = b.logo;
  }
  return map;
};
