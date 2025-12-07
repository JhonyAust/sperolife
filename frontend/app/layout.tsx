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

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SperoLife",
  description: "Style You Believe In",
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