# Next.js Migration Handover

Last updated: 2026-10-15 (Europe/London)

## 1. Project objective and current status

Migrate Our Astro Journey from the existing static HTML/CSS/JavaScript site to Next.js, React and TypeScript, preferably with the App Router and static export, while preserving its public URLs, content, SEO, styling, interactive tools and current production availability.

**Status: Phase 1 audit and safe preparation in progress.** The public GitHub Pages branch `main` has not been modified. A dedicated development branch was created. The initial repository tree and all current HTML page metadata/script references were inventoried. Source-level behavior, API dependencies, hosting workflow, credentials handling and full regression baseline still need review. No Next.js files have been added yet.

## 2. Repository and development branch

- Repository: https://github.com/belgn1978/our-astro-journey
- Default/production branch: `main`
- Development branch: `nextjs-migration-2026-10`
- Development branch base: `main` at `9267704fc2797436a96ba5c0c2028ae0648d4d52` (2026-10-15, “Add YouTube channel to social footer”).
- Repo is public; GitHub Pages is enabled. No local checkout was available in this work session, so repository reads/writes used the GitHub connector. Local install/build/browser tests are not yet possible from this workspace.
- Latest observed commit: `9267704fc2797436a96ba5c0c2028ae0648d4d52`.

## 3. Current architecture and hosting

- Static multi-page site: 29 HTML files (including two review directory index pages), shared CSS and browser JavaScript under `assets/`.
- GitHub Pages is enabled and `main` currently represents production.
- Root includes `.htaccess`, `CNAME`, `robots.txt`, `sitemap.xml`, and `.github/workflows/deploy-ionos.yml`. The workflow and deploy guide must be inspected to reconcile current production deployment configuration and any IONOS staging/deployment work.
- Root also contains `backend-ionos/` PHP endpoints and configuration. This is an existing service boundary and may be used by tools. It must not be moved, modified or exposed during this migration without a reviewed dependency map. A tracked `backend-ionos/config.php` exists; its contents have not been reproduced in this handover. Secret handling must be checked before any commit/archive.
- No Node/Next package manifest appeared in the repository tree at the audited `main` head.

## 4. Target architecture

Planned, not implemented:

- Next.js App Router with React and TypeScript; reusable shared layout, header/navigation, footer/social links and donation section.
- Static export for IONOS shared hosting if all required behavior can remain client-side or use existing separately hosted PHP/API services.
- Preserve existing flat `.html` paths first. Evaluate route generation or compatibility files so existing canonical URLs and indexed pages remain valid.
- Keep browser-only interactions as client components; move data and presentation into typed modules where practical.
- Copy the current design system and assets before restyling. No redesign is in scope.
- Do not assume Next server runtime, change DNS/live hosting, or modify Astra infrastructure. Staging and deployment approach remains to be verified.

## 5. Complete page and feature inventory

### Public HTML pages and current path/URL

All root pages currently resolve at `https://ourastrojourney.co.uk/<filename>`; root `index.html` is `/`. Preserve these exact paths unless a verified need requires a documented redirect.

| Existing path | Page / current source finding | Planned Next.js replacement |
|---|---|---|
| `/` (`index.html`) | Homepage; latest news/updates, analytics consent/control, support/donation module | Static page + shared shell; preserve tracking controls and donation |
| `about.html` | About / project story | Static page with metadata |
| `affiliate-links.html` | Affiliate offers and disclosure; affiliate click tracking | Static offer data + tracking client behavior |
| `beginner-learning-path.html` | Multi-stage learning path | Static guide |
| `common-beginner-mistakes.html` | Beginner guide | Static guide |
| `contact.html` | Contact instructions/links; form behavior not yet audited | Static page; preserve contact method |
| `dark-skies.html` | Nearby known dark-sky sites; location/Bortle search; weather pairing; custom JS | Client tool around reviewed data/API modules |
| `first-night-checklist.html` | First-night checklist | Static guide |
| `gallery.html` | Combined astrophotography/gallery landing page | Gallery page using existing assets |
| `how-we-test-gear.html` | Review methodology | Static guide |
| `hubble-gallery.html` | Hubble-inspired/deep-sky gallery | Gallery page |
| `hubble-jwst-data-finder.html` | Legacy URL; “tool has moved” page; canonical currently points to downloader URL | Preserve compatibility/redirect decision after URL and sitemap audit |
| `hubble-jwst-fits-downloader.html` | Currently displays maintenance notice; prior tool and data availability need history/source review | Preserve current behavior and assess tool/source requirements |
| `iss-transit-planner.html` | ISS solar/lunar transit planning tool | Client tool; dependencies and calculation services to audit |
| `moon-gallery.html` | Moon image gallery | Gallery page |
| `news.html` | Astronomy news and events | Static page; assess update/data workflow |
| `privacy.html` | Privacy policy; analytics/location processing references | Static legal page; keep aligned with integrations |
| `reviews.html` | Telescope reviews listing; `reviews.js` | Review index and shared review cards |
| `reviews/index.html` | Duplicate/compatibility review index, canonical `reviews.html` | Preserve compatibility |
| `reviews/entries/index.html` | DWARF Mini review; affiliate tracking; review media | Review detail template/content |
| `smart-telescope-setup.html` | Smart telescope setup guide | Static guide |
| `solar-eclipse-guide.html` | Solar eclipse safety/imaging guide | Static guide |
| `start-here.html` | Beginner start page | Static guide |
| `target-category.html` | Catalogue category/detail listing behavior; target datasets and JS | Static route data + interactive catalogue as needed |
| `target.html` | Individual target details and field-of-view behavior; current canonical absent | Pre-render key targets plus compatibility query handling, after route inspection |
| `targets.html` | Astronomy Target Catalogue; filters by category/difficulty/visibility/type/integration/location | Pre-rendered crawlable content + client filtering/location |
| `terms.html` | Terms of service | Static legal page |
| `tools.html` | Tools directory | Static page |
| `useful-resources.html` | Beginner learning/resources hub | Static page |
| `weather.html` | Astronomy weather forecast/search | Client tool; API/service to audit |

### Shared code, content, static resources and integrations

- Stylesheets: `assets/css/reset.css`, `styles.css`, `affiliate.css`, `support.css`, `target-fov.css`.
- Browser JS: `main.js`, `analytics-control.js`, `affiliate-tracking.js`, `support.js`, `site-updates.js`, `reviews.js`, `darksky-finder.js`, `darksky-known-sites.js`, `target-catalogue.js`, `target-data*.js`, `data-finder*.js`.
- Target datasets: `target-data.js`, `target-data-messier.js`, `target-data-messier-extra.js`, `target-data-notable.js`.
- Images and media: branding assets; eclipse teaching images; gallery and telescope-review images/video; DWARF Mini guide MP4; eclipse safety PDF. Preserve all asset URLs and alt text.
- Search/indexing: `sitemap.xml`, `robots.txt`, per-page titles/descriptions/canonicals, Open Graph tags and JSON-LD present on audited pages. Current catalogue category/detail canonicals were absent in the sampled source.
- Analytics: page-level analytics-control script is widely included; homepage uses a consent-aware variant. Site-owner and test-session exclusions are known project requirements but exact code behavior needs an implementation audit.
- Affiliate/donation: affiliate links and disclosures; affiliate click script on offers and review detail; homepage support/donation module and support stylesheet/script.
- Social links: Instagram, TikTok, Threads, and YouTube (`https://www.youtube.com/@OurAstroJourneyYT`) were present per current project direction; verify and centralize from `main.js`.
- External services, APIs, API-key use, contact workflow and structured data are not yet fully mapped. Do not copy secrets into Next.js public configuration.
- Server-side/external integration candidate: `backend-ionos/` PHP implementation (search, resolve, products, download manifest, MAST client, caching and ranking/resolution libraries). Exact call sites and host boundaries remain under audit.

## 6. Migration progress by page and component

- Repository and branch: **completed and verified** (GitHub API confirms repository, Pages enabled, current default branch and new branch).
- Source file tree inventory: **completed and verified** (153 repository tree entries at audited main commit; 29 HTML files including nested review indexes).
- HTML metadata, canonicals, stylesheets, scripts, and top headings: **completed and verified** for all 29 HTML files.
- Detailed tool behavior/API map: **in progress**.
- Shared header/footer/navigation and social link implementation review: **planned**.
- Next.js/TypeScript/static export foundation: **planned; not implemented**.
- Page migrations and test coverage: **not started**.
- IONOS staging/deployment investigation: **not started**.

## 7. Files created, modified or removed

- Created: `docs/NEXTJS_MIGRATION_HANDOVER.md` (this living handover; first development-branch file).
- Modified: none.
- Removed: none.
- Production files/configuration: untouched.

## 8. Dependencies and configuration changes

- No dependency or configuration changes yet.
- No Next.js package exists in the audited root tree.
- External Font Awesome stylesheet is included on most pages; assess whether to preserve remote load or replace with a small free/local icon approach.
- IONOS PHP configuration files are out of scope until call sites and secret exposure risks are mapped.

## 9. Tests completed and their results

- GitHub repository metadata read: passed; repository is public, Pages enabled, default branch `main`.
- Branch creation: passed; `nextjs-migration-2026-10` created from `main`.
- Recursive repository tree read: passed; GitHub reported `truncated: false`, 153 entries.
- Page audit: passed for title, description, canonical, stylesheet/script references and initial H1/H2 text across 29 HTML files.
- Local build, TypeScript, browser rendering, mobile/desktop, link, accessibility, tool/API, SEO crawl and production export tests: **not run**. This environment did not contain a local repository checkout at session start.

## 10. Known bugs and unresolved issues

- Need confirm the actual behavior and service dependencies for dark skies/Bortle/location search, weather, ISS planner and Hubble/JWST downloader.
- Need inspect GitHub Actions IONOS workflow and `DEPLOY.md` before classifying production vs staging deployment.
- Need safely audit `backend-ionos/config.php` for credential exposure without echoing secrets into logs, commits or handover. If secrets are tracked, document and address only with explicit care; do not rotate or alter live credentials as part of migration.
- Catalogue target/category paths rely on legacy page/query behavior and lack sampled canonical links; URL preservation must be designed around actual inbound URLs and sitemap entries.
- `hubble-jwst-data-finder.html` canonical currently points at downloader, while both pages exist and the first says the tool moved. Clarify desired compatibility behavior from source and sitemap.
- Contact page is present but no form submission behavior has yet been confirmed.
- IONOS static-export support, clean URLs, upload path, staging options, HTTPS/caching and rollback are unverified.
- No visual baseline screenshots or browser tests have been captured.

## 11. Decisions made and reasons

- Use a dedicated branch from the current `main` SHA to isolate all migration work and preserve live Pages deployment.
- Keep exact legacy `.html` paths as the default route-migration target because preserving existing search URLs is a major requirement.
- Do not make any changes to `main`, DNS, live domain, GitHub Pages configuration, IONOS, or Astra-related infrastructure.
- Do not choose static export as final until PHP/API-dependent features are mapped.

## 12. Hosting and deployment status

- Current: GitHub Pages is enabled for the repository; no production changes made.
- IONOS Web Hosting Plus: user reports an existing contract and existing Astra infrastructure. Migration must isolate the website's own files/subdomain and must not interfere with Astra.
- Repository includes a workflow named `.github/workflows/deploy-ionos.yml` and `DEPLOY.md`; these are not yet inspected. Presence alone does not establish current deployment destination.
- Static export and IONOS staging: not yet tested or configured.
- Production cutover: not authorized or attempted.

## 13. Risks and rollback considerations

- URL changes can affect search indexing and inbound links; preserve paths and metadata, inspect full sitemap, and use verified permanent redirects only where needed.
- Client-only rendering can make important content harder to crawl; pre-render page content and target listings.
- Existing PHP back-end may be required for catalogue, downloads or search. Static export cannot replace those endpoints by itself.
- Current `main`/GitHub Pages is the rollback source and must remain deployable until cutover is explicitly approved.
- Do not overwrite shared IONOS directories or Astra subdomains/configuration; staging requires an isolated directory/subdomain.
- Never include API secrets in browser bundles, commits, handover text, or generated deployment archives.

## 14. Exact next steps

1. Inspect `.github/workflows/deploy-ionos.yml`, `DEPLOY.md`, `.htaccess`, full sitemap and navigation/footer code.
2. Read tool-specific JS and PHP endpoint call sites to map APIs, location permission flows, query parameters, affiliate/donation interactions and analytics exclusions.
3. Record each URL, feature, API/service, metadata and deployment finding in this handover; update audit statuses.
4. Inspect available local authoring/testing access. Obtain a repository checkout or set up the local branch before implementing the build.
5. Add the Next.js + TypeScript App Router foundation and preserve existing design/assets; configure static export only after backend decisions.
6. Add shared layout/navigation/footer (including Instagram, TikTok, Threads and YouTube) and migrate one representative informational page; test before continuing.
7. Update this handover after each verified milestone and commit it regularly on `nextjs-migration-2026-10`.

## 15. Last completed task and current work in progress

- Last completed: repository tree and current page metadata/source references inventoried; development branch created.
- Current work in progress: detailed source audit of tools, deployment configuration and service/API boundaries before choosing a static-export implementation.
