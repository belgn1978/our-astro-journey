const socials = [
  { label: "Instagram", href: "https://www.instagram.com/our.astro.journey" },
  { label: "TikTok", href: "https://www.tiktok.com/@ourastrojourney" },
  { label: "Threads", href: "https://www.threads.net/our.astro.journey" },
  { label: "YouTube", href: "https://www.youtube.com/@OurAstroJourneyYT" },
];

export function SiteFooter() {
  return (
    <footer>
      <div className="footer-content">
        <p className="footer-heading">Connect With Us</p>
        <div className="social-links">
          {socials.map(({ label, href }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={`Our Astro Journey on ${label}`}>
              {label}
            </a>
          ))}
        </div>
        <nav className="footer-legal" aria-label="Legal">
          <a href="/privacy.html">Privacy</a>
          <a href="/terms.html">Terms</a>
          <a href="/contact.html">Contact</a>
        </nav>
      </div>
    </footer>
  );
}
