# Hubble / JWST downloader — test-only progress, 2 November 2026

## Status
Version 8 is prepared on a review branch. **Not installed on IONOS, not published, not approved for public use.** The existing public maintenance page and production API implementations are unchanged. Siril registration/combination and broader real galaxy/JWST regression checks remain outstanding.

## Reproduced causes
- The shared Pillars alias (274.7000, -13.8067) was offset from the ESA/Hubble heic1501a published field centre (18h18m52.72s, −13°50′21.97″ = 274.7196666666667, −13.83943611111111). The test search and ZIP preparation use that published centre. The production resolver remains unchanged.
- A direct MAST Products response for obsid 26311870 lists real DRC/DRZ products as `type: D`, `productType: SCIENCE`. The production ranker rejected all types except S. A separate test products endpoint/ranker now accepts SCIENCE/DERIVED according to productType. It has a fixture from the actual response.
- Test recommendations now prefer standard visit-combined DRC/DRZ products over larger HAP/skycells; archive size alone is not evidence of usable target coverage.
- Version 7 extracted SCI correctly but checked only WCS boundary overlap. This allowed detector-shaped outlines and target positions on blank data.

References: https://esahubble.org/images/heic1501a/ and https://hst-docs.stsci.edu/drizzpac/chapter-5-drizzlepac-software-package/5-3-astrodrizzle-in-the-pipeline

## Version 8 behavior
- Resolves the requested target on the server; does not trust a client-provided sky position.
- Requires a unique SCI plane and matching WHT plane. Scans every science and weight pixel; finite SCI and strictly positive finite WHT are required throughout a retained region. Real zero/negative SCI values remain valid.
- Finds a conservative tile-aligned rectangular crop containing the target. Every pixel in retained tiles is checked, not sampled. A crop must be at least 256 × 256 and retain at least 5% of the original area. No interpolation, invented filling or resampling.
- Preserves retained pixel bytes and shifts CRPIX when cropping. ZIP streams only crop rows, with FITS block padding and CRC integrity.
- Rejects missing coverage, active external distortions, SIP/non-TAN projections, targets on gaps, unsupported plane types, tiny crops, mismatched filters, programmes, telescope/instrument/detector or narrowband/continuum classes. Conservative rejection is expected for some otherwise usable archives.
- Checks actual primary programme/detector metadata and rejects repeated filters. Existing field-overlap checks remain; all output crops contain the same resolved target position.
- Old version 7 preparation tokens cannot bypass the new gate. Version 8 UI requires matching health capability; old baskets must be rebuilt.
- Metadata records target resolution, crop bounds and source archive products. Output crops can differ in size/grid and still need registration/common-overlap cropping.

A position check does **not** establish that an entire extended object lies inside the crop. Tile selection may discard valid edge pixels to avoid accepting any invalid ones. No claim of automatic scientific registration or a verified complete SHO set is made.

## Real Pillars tests completed
Downloaded original WFC3/UVIS programme 13926 products directly from MAST, inspected actual FITS headers, scanned SCI/WHT arrays and extracted:

| Original product | Filter | Crop origin (zero based) | Output dimensions |
| --- | --- | --- | --- |
| ick906030_drc.fits | F502N | 320, 512 | 3776 × 3840 |
| ick907040_drc.fits | F657N | 320, 512 | 3776 × 3840 |
| ick906050_drc.fits | F673N | 832, 576 | 3264 × 3840 |

An independent NumPy check confirmed **every output pixel equals its original SCI pixel**, all retained SCI values are finite, and all matching WHT pixels are finite and >0. The F502N stretched preview was inspected and visibly shows Pillars structure. This is not a Siril open/register/combine test. The raw FITS (hundreds of MB each) and temporary previews are not committed.

Evidence: `tests/fixtures/pillars-coverage-evidence.json` (dimensions, metadata, output hashes). Actual MAST product metadata: `tests/fixtures/pillars-derived-products.json`.

## Automated validation completed
- PHP syntax checks for test API files.
- Existing FITS extraction and ZIP tests, plus Python ZIP CRC check.
- New coverage regressions: zero/negative SCI, invalid border cropping, internal holes, target on gap/outside field, missing WHT, CRPIX sky-coordinate preservation, streaming exact crop size, mismatched coverage grids, inactive vs active distortion metadata.
- Test product classification on synthetic and actual MAST responses.
- JavaScript syntax and existing browser-code regression harness, now exercising v8.

Commands: `php tests/fits-coverage.test.php`; `php tests/fits-zip.test.php /tmp/test-fits.zip`; `node tests/hubble-download.test.cjs`.
Optional repeat of a downloaded Pillars file: `php tests/check-real-coverage.php INPUT.fits OUTPUT.fits` (fixed published Pillars coordinate).

## Installation / review boundary
The refreshed `downloads/hubble-test-zip-api-install.zip` contains only `test-download/` (five PHP files plus INSTALL.txt). Upload that directory to the existing `/astro-api/` location; leave bootstrap/config/lib/cache and production endpoints untouched. The separate test HTML must load `assets/js/data-finder-v8.js` from this branch. Test health must include `version:8`, `pixelCoverage:true`, `streamingZip:true`.

Do not merge/publish/install without Matt's approval. SSH deployment secrets were previously missing. No deployment was attempted in this session.

## Still required before public release
1. Install approved test build and verify actual IONOS preparation/streaming time, memory and downloaded ZIP integrity. Full scans transfer more data during preparation; slow MAST responses may exceed PHP timeouts. No false-ready download should result.
2. Open all three resulting FITS in Siril; register, crop to common overlap and combine. Inspect the resulting target framing and alignment.
3. Real-data galaxy and JWST multi-filter checks, including conservative rejection cases, complete-object framing and desired narrowband mapping.
4. Desktop/mobile browser interaction and stale-cache checks against the installed test build.
5. Only after those pass, obtain explicit approval for a separate public rollout.
