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
      <header className="site-header">
        <div className="brand">
          <Link href="/">
            <a>Our Astro Journey</a>
          </Link>
        </div>
        <nav className="site-nav">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <a>{link.label}</a>
            </Link>
          ))}
        </nav>
      </header>
      <main className="site-main">{children}</main>
      <footer className="site-footer">
        <p>© 2026 Our Astro Journey. Beginner astrophotography, moon shots, nebula imaging, telescope tips.</p>
      </footer>
    </div>
  );
}
