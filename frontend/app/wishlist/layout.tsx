import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Wishlist",
  // Personal page: keep it out of search results
  robots: { index: false, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
