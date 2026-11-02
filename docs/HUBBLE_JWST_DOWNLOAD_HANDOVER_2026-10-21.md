# Hubble / JWST FITS Downloader: Handover (21 October 2026)

## Status
**OPEN / NOT FIXED / LIVE BEHAVIOUR NOT RE-VERIFIED.** Documentation only. Do not describe the downloader as repaired until end-to-end tests pass.

## Existing implementation
Continue from the existing website repository and inspect:
- `hubble-jwst-data-finder.html`
- `hubble-jwst-fits-downloader.html`
- `hubble-gallery.html`
- `backend-ionos/download-manifest.php`
- Any linked JavaScript, MAST archive API calls, download links, and scripts.

Prior work reportedly added direct FITS downloads, PowerShell and curl download options, and MAST archive access. The September deployment was not conclusively live-verified because caching complicated checking.

## Reported failure / current uncertainty
- User recalls downloaded files were **not the correct files for the intended processing workflow**.
- Earlier diagnosis: “Add recommended files” selected the first four observation IDs, rather than selecting useful observations/products from distinct colour filters.
- Some `*_drw.fits` files were genuine science products but not necessarily the best files for RGB/SHO-like colour-composite processing in Siril.
- Need distinguish previews (JPEG/PNG), raw/calibration/support products, calibrated science FITS, and combined/drizzled science FITS.
- This is a **reported historical issue**, not a newly reproduced or root-cause-verified failure.

## Required work, in priority order
1. Trace current search → observation → product → recommendation → manifest → direct download flow. Inspect current implementation before editing.
2. Reproduce with a known Hubble target (e.g. Pillars of Creation) and record observation IDs, product filenames, filters, sizes, MIME/types, URLs, and actual downloaded file headers.
3. Fix “Add recommended files” to choose suitable science products across **distinct available filters** rather than simply first four observation IDs. Avoid mixing incompatible instruments/fields/pointings without warning.
4. Clearly label instrument, filter (examples F502N, F657N, F673N), exposure/processing level, file size and whether the file is a preview, raw, calibrated, or combined product.
5. Prefer processing-ready FITS products where available, but explain differences and permit informed manual selection. Do not imply all FITS products can be combined directly.
6. Ensure direct download, manifest, PowerShell and curl methods all reference the same verified product files; handle redirects, errors and archive availability.
7. Verify FITS signatures/headers and open a downloaded multi-filter set in Siril. Confirm alignment and ability to make a meaningful colour composite, or clearly document limitations.
8. Test desktop and mobile browser behaviour, cached deployment and broken/missing products. Add regression tests where practical.
9. Only after passing tests, deploy and verify the live site; record test evidence, changes and any remaining limitations.

## Acceptance criteria
- Search results resolve to the intended archive observations.
- Recommended files correspond to real, downloadable, correctly labelled products across appropriate distinct filters.
- Downloads are actual expected FITS data, not an HTML error page, preview, or unintended auxiliary product.
- Download scripts and UI match; downloaded products can be inspected and used as documented.
- Live website verified after deployment.

## Working rules
Do not rebuild from scratch. Preserve existing working functionality. Inspect code and test before deployment. No changes to the live site as part of this handover.


## Architecture decision — 2 November 2026 (supersedes target-name-first recommendations)

**Do not release the public downloader.** The live IONOS test ZIP backend v7 works, but the Siril test of `Pillars_of_Creation_M16_Eagle_Nebula_Red_F775W` showed a readable 4126×4387 mono star field with no recognisable Pillars. This is not proof the Pillars are absent; it is proof that archive target-name association and successful FITS parsing are insufficient to certify target coverage. A filename is not verification.

### Required redesign
1. Offer two discovery routes: a **verified target catalogue** for beginners and an **advanced archive search** with clear unverified warnings. Do not label candidate catalogue entries verified until independently checked.
2. Index known suitable HST/JWST *imaging programmes and products*, with programme ID, product ID, instrument, actual filter, target aliases and exact sky coordinates. Do not simply search for programmes whose descriptions mention the target.
3. Prefer calibrated combined HST DRZ/DRC and JWST I2D science images. Inspect product metadata and actual FITS HDUs; suffix alone does not establish quality. WFPC2 DRW must pass the same checks and may require special handling.
4. Compute target coverage from actual science-plane WCS/footprint and usable pixel region (including masks/gaps), not observation centre or bounding box alone. Validate that the target lies in meaningful image coverage. Check actual field overlap between channels, not just matching programme/pointing or skycell names.
5. Prefer distinct, compatible filters, with transparent *display colour* assignments rather than pretending every filter is physical RGB. Do not promise three-channel colour where compatible images are unavailable.
6. Reject misleading ready-to-process recommendations, auxiliary/quality planes, empty or unusable science footprints, non-overlapping fields and incompatible detector images. Do not alter or invent scientific pixels to hide irregular shapes; choose suitable mosaics or explain limitations.
7. Retain the proven IONOS `/astro-api/test-download/` direct ZIP service, human-readable FITS filenames, original IDs, `FILES_AND_FILTERS.json` and `READ_ME.txt`. Do not redeploy the backend unless the validation requirements necessitate it; do not break the existing working ZIP route.
8. Add regression tests for false-positive target matches, object-in-bounding-box-but-not-usable-pixels, mismatched footprints, unsupported HDUs, incomplete filters, and valid science products.

### First milestone and release gate
Find one authentic HST or JWST multi-filter Pillars of Creation dataset, document programme/product IDs, verify that the **Pillars themselves** are inside usable science pixels, produce a direct ZIP and have the user open its individual channels in Siril. A successful API response or FITS load is not acceptance. Record evidence and limitations before adding further verified targets. Keep `hubble-jwst-fits-downloader.html` under maintenance until explicit user approval.
