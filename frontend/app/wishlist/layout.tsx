import type { Metadata } from "next";
import { WISHLIST_ENABLED } from "@/lib/features";

export const metadata: Metadata = {
  // While switched off the page is a 404, so it shouldn't mention the wishlist
  title: WISHLIST_ENABLED ? "My Wishlist" : "Page not found",
  // Personal page: keep it out of search results
  robots: { index: false, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
