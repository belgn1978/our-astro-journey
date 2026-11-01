# Hubble/JWST downloader test update — 1 November 2026

## Release gate
The public `hubble-jwst-fits-downloader.html` remains under maintenance, unchanged.
Only `hubble-jwst-fits-downloader-test-9f4c2d7a.html` uses v6. It is an unlisted,
noindex test URL, not an authenticated/private page. Do not restore the public
page until Matt has tested the workflow and approved release.

Continue the 21 October handover; do not mark all acceptance criteria complete.

## Changes
- Reject previews, support/headerlets and raw products from automatic colour sets.
- Automatic sets require three complete, distinct filtered combined image products.
  Calibrated exposures remain available for manual selection.
- Reject mismatched HST skycell IDs even when archive observation centres coincide.
- Check NIRCam module availability against the intended filter, not just filenames.
- Keep manual product browsing available for one/two-filter groups.
- Show original filenames, types and sizes honestly in the basket; direct original
  download links are restored. Isolate v6 selections from old cached baskets.
- Windows and shell scripts download those same original products. They no longer
  claim an unverified Siril `load`/`save` operation extracts SCI automatically.
- Local browser extraction saves a single uncompressed 2-D SCI plane as primary
  FITS, preserving pixel bytes, science header WCS/scaling/units and descriptive
  primary metadata. Remove obsolete checksums and extension-only structural cards.
  Reject truncation, multiple SCI detectors, cubes and compressed image tables.
- Choose a downloaded original file to extract it. No upload or server changes.
  Direct fetch from MAST was checked with Origin and did not return CORS permission;
  do not promise one-click in-page archive fetching. Limit source files to 512 MiB.

## Evidence
- Live API search: Pillars of Creation/HST succeeded. Candidate observation IDs
  26523807, 26311868, 26311871 each returned calibrated exposures rather than combined
  products; v6 correctly refuses to automatically call these a ready colour set.
- Retrieved actual `iehc98lcq_drc.fits` from official MAST: 217,203,840 bytes.
  Primary + SCI + WHT + CTX + HDRTAB. Extracted SCI: 4125 × 4385, single primary HDU.
- Independent Python check confirmed exact pixel bytes, WCS, units and scaling.
  SCI pixel SHA256: bea405fe1b6315b481fbdc2d63ce1dc3ba94491379bfefeb2b0959438c356e84.
- Node regression checks cover malformed/truncated input, multiple SCI detectors,
  compressed tables, primary images, unchanged float/NaN bytes, missing colour
  channels, auxiliary/previews, mismatched skycells and unique output identifiers.
- Syntax checks and HTML IDs/aria-controls passed.

## Still to test
Siril is not installed in this environment. Opening a complete multi-filter set,
registration, a meaningful colour composite, Windows/Terminal scripts on actual
user machines and full mobile download behaviour remain user acceptance checks.
Observation-centre matching is approximate, not a product footprint/WCS guarantee.
Some MAST product lists contain no combined images; manual inspection is required.
Pixel-preserving SCI extraction alone does not calibrate, register or combine data.

## Reproduce checks
`node --check assets/js/data-finder-v6.js`
`node --check assets/js/fits-science.js`
`node tests/hubble-download.test.cjs`
Optional arguments: downloaded Pillars search JSON, real original FITS, output FITS.
