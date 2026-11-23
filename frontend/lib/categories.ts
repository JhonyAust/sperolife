// Product groups shown as one category on the site.
// Shirts, T-Shirts and Shackets are all shown together as "Shirts".

export const SHIRT_SUBCATEGORIES = ["Shirts", "T-Shirts", "Shacket"];
export const SNEAKER_SUBCATEGORIES = ["Sneakers"];

export const SHIRTS_URL = `/products?subCategory=${SHIRT_SUBCATEGORIES.join(",")}`;
export const SNEAKERS_URL = `/products?subCategory=${SNEAKER_SUBCATEGORIES.join(",")}`;

type CategorizedProduct = { subCategory?: string | null };

const sub = (p: CategorizedProduct) => (p.subCategory || "").toLowerCase();

export const isShirtProduct = (p: CategorizedProduct) => sub(p).includes("shirt") || sub(p).includes("shacket");

export const isSneakerProduct = (p: CategorizedProduct) => !isShirtProduct(p) && sub(p).includes("sneaker");

// Friendly label for a ?subCategory= value, e.g. "shirts,t-shirts,shacket" -> "Shirts"
export const subCategoryLabel = (value: string) => {
  const parts = value.split(",").map((v) => v.trim().toLowerCase()).filter(Boolean);
  if (parts.length > 1 && parts.every((p) => SHIRT_SUBCATEGORIES.some((s) => s.toLowerCase() === p))) return "Shirts";
  return value;
};
