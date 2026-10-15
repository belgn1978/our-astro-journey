"use client";

import { useEffect, useState } from "react";

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

  useEffect(() => {
    document.body.classList.toggle("nav-open", open);
    return () => document.body.classList.remove("nav-open");
  }, [open]);

  return (
    <>
      <header id="header-main">
        <div className="logo-container">
          <a href="/" className="nav-link logo-link" id="logo" aria-label="Our Astro Journey home">
            <img src="/assets/images/branding/logo.png" alt="Our Astro Journey" className="logo-img" width="1408" height="768" />
          </a>
        </div>
        <button
          type="button"
          id="mobile-menu-button"
          className="mobile-menu-toggle"
          aria-expanded={open}
          aria-controls="mobile-navigation-main"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setOpen(value => !value)}
        >
          <span aria-hidden="true">{open ? "×" : "☰"}</span>
        </button>
        <nav id="navigation-main" aria-label="Primary navigation">
          {links.map(([label, href]) => <a href={href} className="nav-link" key={href}>{label}</a>)}
          <a href="/#support-oaj" className="nav-link oaj-support-nav">Support us</a>
        </nav>
        <nav
          id="mobile-navigation-main"
          className={`mobile-navigation${open ? " open" : ""}`}
          aria-label="Mobile primary navigation"
          aria-hidden={!open}
          inert={!open}
        >
          <button type="button" id="mobile-menu-close" className="mobile-menu-close" aria-label="Close navigation menu" onClick={() => setOpen(false)}>
            <span aria-hidden="true">×</span>
          </button>
          {links.map(([label, href]) => (
            <a href={href} className="nav-link mobile-nav-link" key={href} onClick={() => setOpen(false)}>{label}</a>
          ))}
          <a href="/#support-oaj" className="nav-link mobile-nav-link oaj-support-nav" onClick={() => setOpen(false)}>Support us</a>
        </nav>
      </header>
      <div
        id="mobile-nav-backdrop"
        className={`mobile-nav-backdrop${open ? " active" : ""}`}
        aria-hidden="true"
        onClick={() => setOpen(false)}
      />
    </>
  );
}
