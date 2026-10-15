import { LEGACY_SUPPORT_URL } from "../lib/site";

export function DonationSection() {
  return (
    <section id="support-oaj" className="oaj-support-section" aria-labelledby="support-oaj-heading">
      <div className="oaj-support-card">
        <h2 id="support-oaj-heading">Support Our Astro Journey</h2>
        <p>
          Our guides, tools and astronomy resources are free to use. If Our Astro Journey has helped you
          and you would like to support what we are building, you can leave a small tip to help us keep
          creating and exploring.
        </p>
        <a className="button" href={LEGACY_SUPPORT_URL} target="_blank" rel="noopener noreferrer" data-oaj-support>
          Support OAJ
        </a>
        <span className="oaj-support-note">Optional one-time support via Ko-fi.</span>
      </div>
    </section>
  );
}
