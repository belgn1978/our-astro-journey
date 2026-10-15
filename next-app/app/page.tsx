import type { Metadata } from "next";
import { DonationSection } from "../components/donation-section";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { url: "/" },
};

export default function MigrationPreviewPage() {
  return (
    <>
      <section className="migration-preview section-card">
        <h1>Our Astro Journey migration preview</h1>
        <p>
          This isolated Next.js preview is being built alongside the live website.
          Existing pages and tools are being moved in stages, with their URLs,
          content, design and behavior checked against the current site.
        </p>
        <p className="migration-preview-notice">
          This development preview is incomplete and is not ready for deployment.
          The live website remains on its current hosting while the migration is
          developed and tested.
        </p>
      </section>
      <DonationSection />
    </>
  );
}
