import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://ourastrojourney.co.uk"),
  title: {
    default: "Beginner Astronomy & Smart Telescope Guides | Our Astro Journey",
    template: "%s | Our Astro Journey",
  },
  description:
    "Beginner astronomy and astrophotography in plain English, with smart telescope guides, honest reviews, planning tools and real observing experiences.",
  openGraph: {
    type: "website",
    siteName: "Our Astro Journey",
    locale: "en_GB",
    images: [{ url: "/assets/images/branding/hero-ing.jpg", alt: "Night sky background from Our Astro Journey" }],
  },
  icons: {
    icon: [
      { url: "/assets/images/branding/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/assets/images/branding/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/assets/images/branding/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#050812",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en-GB">
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
