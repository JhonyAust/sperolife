import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact SperoLife for orders, delivery and product questions. Cash on delivery all over Bangladesh.",
  alternates: { canonical: "/contact" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
