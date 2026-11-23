# Astro migration prototype

This prototype branch builds three existing public routes with Astro's static output:

- `/` — homepage
- `/articles.html` — article listing
- `/reviews/entries/death-valley-observatories-interview.html` — DVO interview

The pages share `BaseLayout.astro`, `SiteHeader.astro`, and `SiteFooter.astro`. The homepage and article listing reuse the current page copy. The DVO feature retains the existing article copy and credits, while its photographs are rendered as responsive WebP display variants with direct links to the unchanged full-resolution originals.

## Local commands

Requires Node.js `>=22.23.4`.

```bash
npm ci
npm run dev
npm run build
npm run preview
```

The static build is written to `dist/`. The build copies only the assets and legacy legal pages needed by the prototype. The prototype was pushed to the `astro-migration` branch for review. The production deployment workflows, GitHub Pages settings, DNS, analytics property, and live site were not changed. The branch has not been merged or deployed. GitHub Pages publishing settings were not available through the repository API; keep the prototype undeployed during review and do not invoke deployment workflows.

## Review notes

- Astro renders the pages to plain HTML; React is not added. The only client-side script for the three routes handles the shared accessible mobile menu and cookie-settings button. The homepage retains the existing support-click tracking script.
- Analytics continues to use `assets/js/analytics-control.js`, including its current consent, owner, and test-session behavior. The script must remain the only route to loading the GA4 tag.
- Canonical routes, page titles, descriptions, Open Graph metadata, article/collection structured data, and the existing Google site verification token are preserved for the migrated pages.
- Non-prototype navigation links on the local preview point to the currently published site so tools and other existing pages remain available.
- `privacy.html` and `terms.html` are included as supporting destinations for the shared footer and consent dialog; their links to non-prototype pages continue to the live site. They are not part of the three-page migration.
- The legacy `assets/css/styles.css` remains in use for the prototype so the visual comparison starts from the current branding. This prototype does not claim measured performance gains. A reproducible mobile Lighthouse comparison and full-site link/content audit remain before any production migration decision.

## Prototype verification

- `npm run build` succeeds and emits the three Astro routes at the existing `.html` URLs.
- A local-path check passes for the three routes, their built image `srcset` candidates, the shared assets, and the privacy/terms support pages.
- The DVO article has 15 responsive image sources. Their original files total 11,644,699 bytes; selecting the 800-pixel WebP candidate for each totals 805,618 bytes. This is a generated-image file-size comparison, not a measured network transfer or speed score. Full-resolution originals remain available from each figure.
- A browser-based desktop/mobile interaction check and Lighthouse run could not be completed: the available browser cannot connect to the local preview server, and the execution environment does not permit launching Chromium through the test runner. No Lighthouse score or measured page-speed claim is made.

## Follow-up before any production migration

1. Review the three routes and approve the shared header, footer, and article template.
2. Measure the existing site and prototype on the same mobile Lighthouse setup, including transfer size and image payloads.
3. Expand page coverage, content/data migration, redirect mapping, full-site link validation, and accessibility checks.
4. Confirm the GitHub Pages publishing source and update a production build/deploy workflow only after explicit owner approval.
5. Plan a rollback and cutover that preserves all existing URLs, sitemap coverage, consent behavior, affiliate links, content-control dashboard, and astronomy tools.
