import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "About SperoLife, an online store for original sneakers, shirts and accessories in Bangladesh.",
  alternates: { canonical: "/about" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
