# PAGENTS

This file documents the static-site reorganization and path rules for maintainers.

## Current structure

- Root pages remain at the root to preserve public URLs and SEO history.
- Runtime assets are under `assets/`:
  - `assets/css/`
  - `assets/js/`
  - `assets/images/branding/`
  - `assets/images/gallery/`
  - `assets/images/eclipse/`
  - `assets/images/reviews/`
  - `assets/images/general/`
- Downloadable files remain under `downloads/`.
- Review page entries remain under `reviews/entries/`.
- Tooling scripts remain under `scripts/`.

## Do not move these files from the root

- `index.html`
- `about.html`
- `contact.html`
- `gallery.html`
- `news.html`
- `reviews.html`
- `solar-eclipse-guide.html`
- `useful-resources.html`
- `hubble-gallery.html`
- `moon-gallery.html`
- `affiliate-links.html`
- `weather.html`
- `dark-skies.html`
- `robots.txt`
- `sitemap.xml`
- `CNAME`
- `DEPLOY.md`

## Deployment note

- Keep `.github/workflows/deploy-ionos.yml` and `DEPLOY.md` unchanged unless deployment behavior is intentionally being modified.

## Linking conventions

- Use root-relative/relative links that target `assets/css/*` and `assets/js/*` from HTML pages.
- Image URLs should reference `assets/images/<category>/...`.
- Keep canonical URLs and sitemap page URLs unchanged.
