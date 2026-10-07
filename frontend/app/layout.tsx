import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner"
import { Providers } from "./providers";
import FrontendHeader from "@/components/layout/FrontendHeader";
import FrontendFooter from "@/components/layout/FrontendFooter"; 
import { OptimizedDataLoader } from "@/components/Provider/OptimizedDataLoader";
import MetaPixel from "@/components/MetaPixel/MetaPixel";
import FrontendWhatsAppFloat from "@/components/layout/FrontendWhatsAppFloat";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_TITLE, SITE_URL } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: "/",
    locale: "en_BD",
    images: [{ url: "/logo.png", alt: `${SITE_NAME} – ${SITE_TAGLINE}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
         <MetaPixel />
        <Providers>
          <OptimizedDataLoader> {/* 🔥 ADD THIS */}
            <FrontendHeader />
            <main>{children}</main>
            <Toaster position="top-center" richColors />
            <FrontendFooter/>
            <FrontendWhatsAppFloat />
          </OptimizedDataLoader> {/* 🔥 ADD THIS */}
        </Providers>
      </body>
    </html>
  );
}