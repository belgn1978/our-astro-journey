"use client";

import { useState } from "react";

const links = [
  ["Tools", "/tools.html"],
  ["Gallery", "/gallery.html"],
  ["Reviews", "/reviews.html"],
  ["Resources", "/useful-resources.html"],
  ["News", "/news.html"],
  ["About", "/about.html"],
  ["Contact", "/contact.html"],
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header id="header-main">
      <div className="logo-container">
        <a href="/" className="nav-link logo-link" id="logo" aria-label="Our Astro Journey home">
          <img src="/assets/images/branding/logo.png" alt="Our Astro Journey" className="logo-img" width="1408" height="768" />
        </a>
      </div>
      <nav id="navigation-main" aria-label="Primary navigation">
        {links.map(([label, href]) => <a href={href} className="nav-link" key={href}>{label}</a>)}
        <a href="/#support-oaj" className="nav-link oaj-support-nav">Support us</a>
      </nav>
      <button
        type="button"
        className="mobile-menu-toggle"
        aria-expanded={open}
        aria-controls="mobile-navigation-main"
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        onClick={() => setOpen(value => !value)}
      >
        <span aria-hidden="true">{open ? "×" : "☰"}</span>
      </button>
      <nav
        id="mobile-navigation-main"
        className="mobile-navigation"
        aria-label="Mobile primary navigation"
        aria-hidden={!open}
        hidden={!open}
      >
        {links.map(([label, href]) => (
          <a href={href} className="nav-link mobile-nav-link" key={href} onClick={() => setOpen(false)}>{label}</a>
        ))}
        <a href="/#support-oaj" className="nav-link mobile-nav-link oaj-support-nav" onClick={() => setOpen(false)}>Support us</a>
      </nav>
    </header>
  );
}
