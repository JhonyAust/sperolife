import type { Metadata } from "next";
import HomePage from "@/components/home/HomePage";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: SITE_TITLE },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
};

// Tells search engines the site's name, logo and search URL
const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/products?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/logo.png`,
  },
];

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <h1 className="sr-only">SperoLife – Original Sneakers, Shirts &amp; Accessories in Bangladesh</h1>
      <HomePage />
    </>
  );
}
