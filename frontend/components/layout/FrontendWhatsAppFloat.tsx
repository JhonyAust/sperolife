"use client";

import { usePathname } from "next/navigation";
import WhatsAppFloat from "./WhatsAppFloat";

export default function FrontendWhatsAppFloat() {
  const pathname = usePathname();
  
  // Show on home page and product details pages
  const shouldShow = pathname === "/" || pathname.startsWith("/products/") || pathname.startsWith("/products");
  
  if (!shouldShow) return null;
  
  return <WhatsAppFloat />;
}