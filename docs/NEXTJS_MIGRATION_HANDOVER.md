# Next.js Migration Handover

Last updated: 2026-10-15 (Europe/London)

## 1. Project objective and current status

Migrate Our Astro Journey from the existing static HTML/CSS/JavaScript site to Next.js, React and TypeScript, preferably with the App Router and static export, while preserving its public URLs, content, SEO, styling, interactive tools and current production availability.

**Status: Phase 1 audit completed; Phase 2 foundation scaffolding implemented but not yet build-tested.** The public GitHub Pages branch `main` has not been modified. A dedicated development branch was created. The repository tree, all current HTML metadata/script references, key tool code paths, PHP API documentation and IONOS workflow have been reviewed. The isolated Next.js app shell is in next-app/; no legacy content pages have been migrated yet.

## 2. Repository and development branch

- Repository: https://github.com/belgn1978/our-astro-journey
- Default/production branch: `main`
- Development branch: `nextjs-migration-2026-10`
- Development branch base: `main` at `9267704fc2797436a96ba5c0c2028ae0648d4d52` (2026-10-15, “Add YouTube channel to social footer”).
- Latest development branch commit as of 2026-10-15: `03f68357adb56f05be5a09a452b24f93edf29566` (handover updated after foundation).
- Repo is public; GitHub Pages is enabled. No local checkout was available in this work session, so repository reads/writes used the GitHub connector. Local install/build/browser tests are not yet possible from this workspace.
- Latest observed commit: `9267704fc2797436a96ba5c0c2028ae0648d4d52`.

## 3. Current architecture and hosting

- Static multi-page site: 29 HTML files (including two review directory index pages), shared CSS and browser JavaScript under `assets/`.
- GitHub Pages is enabled and `main` currently represents production.
- Root includes `.htaccess`, `CNAME`, `robots.txt`, `sitemap.xml`, and `.github/workflows/deploy-ionos.yml`. The workflow is manual-only (workflow_dispatch), checks out Node 18, expects next-app, runs npm ci, then deletes all files in the configured remote target and uploads next-app/out/*. The workflow comments and DEPLOY.md conflict about push-to-main behavior; the YAML controls and currently has no push trigger. Its target directory is unresolved and destructive, so do not run it until an isolated staging directory is confirmed.
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
- Detailed tool behavior/API map: **in progress**; primary service boundaries summarized in audit update.
- Shared header/footer/navigation: **implemented but not tested** in next-app; desktop and mobile link sets mirror the existing navigation, with accessible toggle state, close control and backdrop.
- Shared social footer: **implemented but not tested**; includes Instagram, TikTok, Threads and the requested YouTube channel.
- Donation section: **implemented but not tested**; Ko-fi URL and current copy are carried over from the current homepage.
- App Router/TypeScript/static export foundation: **implemented but not tested** in next-app; original reset/styles/support CSS and branding assets copied from the current source tree.
- Actual content/tool page migration: **not started**. The development preview is explicitly incomplete and is not ready for deployment.
- IONOS staging/deployment investigation: **in progress**; existing workflow target is unverified and destructive.

## 7. Files created, modified or removed

- Created: docs/NEXTJS_MIGRATION_HANDOVER.md; next-app/package.json; next-app/tsconfig.json; next-app/next.config.ts; next-app/next-env.d.ts; next-app/app/layout.tsx; next-app/app/globals.css; next-app/app/page.tsx; next-app/components/site-header.tsx; next-app/components/site-footer.tsx; next-app/components/donation-section.tsx; next-app/README.md.
- Added copies of existing public styles/assets under next-app/public/assets/css and next-app/public/assets/images/branding, reusing the exact source blobs from main.
- Modified: handover only; no production site files or existing deployment configuration modified.
- Removed: none.
- Production files/configuration: untouched.

## 8. Dependencies and configuration changes

- Added app-scoped package.json with Next.js 16, React 19 and TypeScript ranges; Node.js >=20.9 requirement; App Router config uses output: export, trailingSlash: false and unoptimized images.
- A package-lock.json has not yet been generated or committed. Existing deployment workflow runs npm ci and will fail until a lockfile is added.
- Existing CSS and branding assets are copied into the app's public tree. Font Awesome was not added to the shell; the footer currently uses readable text links.
- Existing IONOS workflow still uses Node 18 and requires a safe, confirmed staging path before updating or dispatching.

## 9. Tests completed and their results

- GitHub repository metadata read: passed; repository is public, Pages enabled, default branch main.
- Branch creation and updates: passed; development branch created from the recorded main SHA and contains the audit and foundation commits.
- Recursive source tree read: passed; GitHub reported truncated: false, 153 entries.
- Page audit: passed for title, description, canonical, stylesheet/script references and initial H1/H2 text across 29 HTML files.
- Source-level checks: completed for navigation markup/CSS, dark-sky service calls, target calculations/storage, MAST backend docs, analytics opt-outs, Formspree contact endpoint, IONOS workflow and rewrite rules.
- New branch tree check: passed; recursive Git tree (not truncated) contains all 15 expected handover, config, app/component and copied CSS/branding files.
- Environment probe: Node 24.19.0 and npm 11.9.0 are available, but this workspace has no repository checkout, package files or installed Next.js. Local build, TypeScript, browser rendering, mobile/desktop, link, accessibility, tool/API, SEO crawl and production export tests therefore remain **not run**.

## 10. Known bugs and unresolved issues

- Need confirm the remaining detailed behavior of the weather and ISS location interfaces, all catalogue query variants, and gallery/review data sources.
- Need inspect GitHub Actions IONOS workflow and `DEPLOY.md` before classifying production vs staging deployment.
- Need safely audit `backend-ionos/config.php` for credential exposure without echoing secrets into logs, commits or handover. If secrets are tracked, document and address only with explicit care; do not rotate or alter live credentials as part of migration.
- Catalogue target/category paths rely on legacy page/query behavior and lack sampled canonical links; URL preservation must be designed around actual inbound URLs and sitemap entries.
- `hubble-jwst-data-finder.html` canonical currently points at downloader, while both pages exist and the first says the tool moved. Clarify desired compatibility behavior from source and sitemap.
- Contact page is present but no form submission behavior has yet been confirmed.
- IONOS Web Hosting Plus package-specific static-file behavior, clean URLs, upload path, staging options, HTTPS/caching and rollback are unverified.
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
- Existing PHP back-end provides the MAST Hubble/JWST Data Finder API at https://api.ourastrojourney.co.uk; no API key or database is required per its README. Static export can call this separate API but cannot replace its PHP endpoints.
- Current `main`/GitHub Pages is the rollback source and must remain deployable until cutover is explicitly approved.
- Do not overwrite shared IONOS directories or Astra subdomains/configuration; staging requires an isolated directory/subdomain.
- Never include API secrets in browser bundles, commits, handover text, or generated deployment archives.

## 14. Exact next steps

1. Inspect `.github/workflows/deploy-ionos.yml`, `DEPLOY.md`, `.htaccess`, full sitemap and navigation/footer code.
2. Read tool-specific JS and PHP endpoint call sites to map APIs, location permission flows, query parameters, affiliate/donation interactions and analytics exclusions.
3. Record each URL, feature, API/service, metadata and deployment finding in this handover; update audit statuses.
4. Inspect available local authoring/testing access. Obtain a repository checkout or set up the local branch before claiming any build/typecheck/browser test.
5. Add the Next.js + TypeScript App Router foundation in next-app/ (the existing manual workflow expects that path), preserve existing design/assets, and pin a supported Node version in CI. Configure static export only after backend decisions.
6. Add shared layout/navigation/footer (including Instagram, TikTok, Threads and YouTube) and migrate one representative informational page; test before continuing.
7. Update this handover after each verified milestone and commit it regularly on `nextjs-migration-2026-10`.

## 15. Last completed task and current work in progress

- Last completed: repository tree and all page metadata/source references inventoried; detailed audit of dark-skies, target catalogue, analytics, MAST API, contact form, workflow, deployment guide and rewrite rules; initial handover committed.
- Current work in progress: implement an isolated Next.js foundation under next-app/, then obtain a local build/test environment.


## Audit update — 2026-10-15

### Verified service and behavior findings

- Dark Skies Finder: assets/js/darksky-finder.js calls the existing Cloudflare Worker at https://oaj-darksky-proxy.matt-f77.workers.dev/ for modeled sky-quality points (Bortle/SQM). It reverse-geocodes points with OpenStreetMap Nominatim, caches place lookups locally, and shows curated astronomy sites from darksky-known-sites.js with Google Maps links. The current tool includes Bortle filtering and nearby site search. No API key appears in the reviewed client file.
- Target Catalogue: assets/js/target-catalogue.js computes visibility, altitude, transit, best months and approximate integration guidance from local target data and local sidereal calculations. Saved location and equipment profiles use localStorage. The default observing profile is a broad northern-sky view (53° N, 2° W, Bortle 6). Preserve user-controlled location/equipment features and query-driven target/category page behavior. Data are in four target-data*.js files.
- Hubble/JWST: the active downloader page currently shows a maintenance message, while the legacy data finder implementation and PHP service remain present. Backend documentation identifies API host api.ourastrojourney.co.uk, PHP 8+, cURL and SimpleXML, and anonymous official STScI MAST calls. Front-end scripts have API-base overrides for localhost and query param ?api=; basket state is in localStorage. No database, credential or paid API is documented.
- ISS Transit Planner: the page directs users to the free external Transit-Finder service and includes location/coordinate assistance. It is not evidence of a local orbital prediction API; detailed location interaction still needs full source inspection.
- Weather: the page links to Clear Outside and provides an external fallback; exact current data-loading behavior remains to inspect.
- Contact: HTML form POSTs to Formspree endpoint https://formspree.io/f/xnjlekvb. Preserve behavior and privacy notice; never replace with a dead static form.
- News/launch API: assets/js/main.js calls Launch Library 2 at ll.thespacedevs.com/2.2.0/launch/upcoming/ without a key and retains celestial events when API fetch fails.
- Analytics: analytics-control.js uses GA4 measurement ID G-J4NC85BT9H, consent state, persistent owner opt-out (oaj_owner=1 / oaj_owner=0) and session test opt-out (oaj_test=1 / oaj_test=0). Query flags are removed from the visible URL after being stored. Automated browsers are also excluded. Preserve these semantics.
- Affiliate/donation: affiliate clicks are sent to GA only when analytics is enabled. Homepage support links have event tracking and existing support styling; preserve payment/link destinations and disclosure after source audit.
- SEO/URLs: .htaccess canonicalizes www to apex, redirects index.html to root, and handles duplicate review paths. Legacy catalogue detail/category pages have no canonical in sampled source. Full sitemap validation remains required.
- IONOS hosting: Next.js official docs confirm output: export emits static HTML/CSS/JS that can be served on a static web server; runtime-dependent features are unsupported. IONOS documents SFTP/SSH access for Web Hosting. The exact current Web Hosting Plus contract's directory, staging capability, rewrite behavior and security settings have not been verified. No DNS or IONOS configuration was changed.
- Node/CI: official Next.js v16 docs require Node.js 20.9 or later. Existing manual IONOS workflow uses Node 18; this must be updated before it can build a Next 16 app, but not until the deployment target is confirmed safe.

### Audit classification

- URLs and page metadata: completed for all 29 HTML files; complete sitemap parity/redirect reconciliation: in progress.
- Tool/service inventory: partially completed; details above verified from source/docs. Remaining: exact weather.html fetch behavior, ISS location helper behavior, all catalogue query variants, browser/API limits, gallery/review data sources and full interactive links.
- Secrets: no secret value was copied or printed. backend-ionos/config.php exists as a tracked file and was deliberately not read. Reviewed backend README says no secrets are required; still verify the file only with a redacted/secret-safe scan before deciding whether its presence is an issue.
- Deployment plan: in progress; existing workflow is manual and destructive at its configured remote path. Do not dispatch until a separate staging target is established and confirmed to contain no live/Astra data.

### Official references checked

- Next.js static export: https://nextjs.org/docs/app/guides/static-exports
- Next.js v16 requirements: https://nextjs.org/docs/app/guides/upgrading/version-16
- IONOS SFTP/SSH account guide: https://www.ionos.co.uk/help/hosting/setting-up-and-managing-ftp-access/creating-an-sftp/ssh-account/


## Foundation milestone — 2026-10-15

- App source is under next-app/ to match the existing manual deployment workflow's expected build directory.
- The foundation uses App Router, TypeScript, static export, no runtime image optimization and the existing site's copied styles and brand files. No API routes or secrets were introduced.
- Shared header links point to the current public .html routes. Mobile navigation tracks expanded state, supports close and backdrop interactions, and uses inert while closed. Footer includes Instagram, TikTok, Threads and https://www.youtube.com/@OurAstroJourneyYT.
- Reusable donation section carries the existing Ko-fi support message and destination. Analytics click tracking and consent controls are not yet migrated; do not mark donation/analytics complete.
- The root route is an explicit migration preview notice, not migrated homepage content. It is not production-ready and must not replace the live site.
- Verification limitation: no local clone or Next installation was available in the workspace. Files were committed, but no npm install, lockfile generation, TypeScript check, Next build, browser or screenshot test was performed. All foundation items remain implemented-but-untested.
- Existing workflow is dangerous if pointed at a live/shared directory: it runs rm -rf on all direct children of its configured target before upload. Target is not known. It remains manual-only and was not dispatched.


## Foundation structure check — 2026-10-15

- GitHub tree verification passed for all 15 expected project/handover and sample copied asset paths. Development tree had 182 entries and was not truncated.
- The production main branch head remains 9267704fc2797436a96ba5c0c2028ae0648d4d52, matching the audited production head. No production branch files were changed.
- This confirms repository structure only; it does not replace the pending npm install, lockfile, typecheck, build, browser, responsive or accessibility testing.
