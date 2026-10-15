import type { Metadata } from "next";
import { SITE_URL } from "./site";

type PageMetadataInput = {
  title: string;
  description: string;
  canonicalPath: string;
  imagePath?: string;
};

export function createPageMetadata({
  title,
  description,
  canonicalPath,
  imagePath = "/assets/images/branding/hero-ing.jpg",
}: PageMetadataInput): Metadata {
  const canonical = new URL(canonicalPath, SITE_URL).toString();
  const image = new URL(imagePath, SITE_URL).toString();

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      siteName: "Our Astro Journey",
      locale: "en_GB",
      title,
      description,
      url: canonical,
      images: [{ url: image, alt: "Night sky background from Our Astro Journey" }],
    },
  };
}
