import { socialLinks } from "../lib/site";

export function SiteFooter() {
  return (
    <footer>
      <div className="footer-content">
        <p className="footer-heading">Connect With Us</p>
        <div className="social-links">
          {socialLinks.map(({ label, href }) => (
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
        <div className="copyright-container">
          <p>© 2026 Matt Brambley | OurAstroJourney</p>
        </div>
      </div>
    </footer>
  );
}
