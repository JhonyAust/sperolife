import type { Metadata } from "next";
import { API_URL, SITE_NAME } from "@/lib/site";

type Props = { params: Promise<{ id: string }> };

// Title, description and share image come from the product itself
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${API_URL}/products/${encodeURIComponent(id)}?trackView=false`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return { title: "Product" };
    const { product } = await res.json();
    if (!product) return { title: "Product" };

    const plain = String(product.shortDescription || product.description || "")
      .replace(/\*\*/g, "")
      .replace(/^\s*(?:[-*•✓✔]|\d+[.)])\s+/gm, "")
      .replace(/\s+/g, " ")
      .trim();
    const price = product.salePrice || product.price;
    const description = [
      plain.slice(0, 150),
      price ? `Price ৳${price}.` : "",
      "Cash on delivery all over Bangladesh.",
    ]
      .filter(Boolean)
      .join(" ")
      .slice(0, 300);
    const image = product.images?.[0];

    return {
      title: product.name,
      description,
      alternates: { canonical: `/products/${product.slug || id}` },
      openGraph: {
        type: "website",
        siteName: SITE_NAME,
        title: product.name,
        description,
        url: `/products/${product.slug || id}`,
        ...(image && { images: [{ url: image, alt: product.name }] }),
      },
      twitter: {
        card: "summary_large_image",
        title: product.name,
        description,
        ...(image && { images: [image] }),
      },
    };
  } catch {
    return { title: "Product" };
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
