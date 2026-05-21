import Link from 'next/link';
import { ReactNode } from 'react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/projects', label: 'Projects' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/news', label: 'News' },
  { href: '/contact', label: 'Contact' }
];

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export default function Layout({ children, title = 'Our Astro Journey' }: LayoutProps) {
  return (
    <div className="site-shell">
      <a href="#site-main" className="skip-link">Skip to main content</a>
      <header className="site-header" role="banner">
        <div className="brand">
          <Link href="/">
            <a aria-label={title}>Our Astro Journey</a>
          </Link>
        </div>
        <nav className="site-nav" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <a>{link.label}</a>
            </Link>
          ))}
        </nav>
      </header>
      <main className="site-main" id="site-main" role="main">
        {children}
      </main>
      <footer className="site-footer" role="contentinfo">
        <p>© 2026 Our Astro Journey. Beginner astrophotography, moon shots, nebula imaging, telescope tips.</p>
      </footer>
    </div>
  );
}
