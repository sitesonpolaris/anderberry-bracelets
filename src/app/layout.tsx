import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { site } from "@/lib/site";
import "./globals.css";

const gloock = localFont({
  src: "../fonts/gloock-latin-400-normal.woff2",
  variable: "--font-gloock",
  display: "swap",
  weight: "400",
});

const hanken = localFont({
  src: [
    { path: "../fonts/hanken-grotesk-latin-400-normal.woff2", weight: "400" },
    { path: "../fonts/hanken-grotesk-latin-500-normal.woff2", weight: "500" },
    { path: "../fonts/hanken-grotesk-latin-600-normal.woff2", weight: "600" },
  ],
  variable: "--font-hanken",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "AnderBerry Bracelets | Hand-strung in Charlotte since 2014", template: "%s | AnderBerry Bracelets" },
  description: site.description,
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_US",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "AnderBerry tiger eye and onyx Tap-to-Connect bracelet" }],
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#f2ede4",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${gloock.variable} ${hanken.variable}`}>
      <body>{children}</body>
    </html>
  );
}
