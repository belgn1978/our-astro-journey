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

## User acceptance findings — 1 November 2026 (Helix / HST WFPC2)
- Windows .ps1 script downloaded original archive FITS sequentially. First file `u39s0401r_drw.fits` reached expected ~250.5 MB; subsequent files began. Verify final integrity and all three completed before marking download acceptance passed.
- Filenames `u39s0401r_drw.fits`, `u39s0403r_drw.fits`, `u39s0405r_drw.fits` are opaque for beginners. Add descriptive local output names with target, telescope, instrument, filter, channel label and original archive ID; preserve original identifier and FITS bytes. Apply consistently to Windows/Mac/Linux/individual downloads, and consider a metadata manifest.
- Siril 1.4.5 image compositing showed ERROR on a direct original FITS. Opening `u39s0405r_drw.fits` instead loaded a 2-image sequence; conversion created two 4676×4676 32-bit mono FITS files. One showed a sparse star field; the other showed WFPC2-like detector/calibration geometry (diamond-shaped footprint, dark circles and lines). Exact HDU types are NOT yet confirmed from headers; do not assume either is SCI without inspection.
- HIGH PRIORITY: inspect actual FITS HDU headers/EXTNAME, detector geometry, WCS and science/quality/calibration content for WFPC2 `*_drw.fits`. Ensure the existing local SCI extractor explicitly handles or clearly rejects these multi-image products and never silently treats ancillary planes as science frames or automatically combines incompatible detectors. Preserve scientific geometry; do not mislabel the file as immediately RGB-ready.
- Verify exported single science planes open individually in Siril and can be registered across F450W/F555W/F814W when footprints genuinely overlap. Add regression fixture(s) for this WFPC2 case, with honest warnings where automatic extraction/compositing is unsupported.
- Release gate unchanged: public downloader stays offline until end-to-end user tests and explicit approval.

## Additional user requirements — readable downloads and no PowerShell by default
- REQUIRED: Final downloaded science FITS files must have human-readable filenames. Minimum acceptable is target name plus colour/channel (e.g. `Helix_Blue.fits`, `Helix_Green.fits`, `Helix_Red.fits`); preferably also filter (e.g. `Helix_Blue_F450W.fits`). Avoid opaque archive-only names. Sanitize names and append original archive identifier when needed to prevent collisions. Do not change FITS scientific content; include original filename in metadata/manifest where appropriate.
- REQUIRED UX: Provide a straightforward browser-based **Download FITS** option without needing PowerShell. Offer direct original FITS download links from MAST as the simplest immediate route, noting that remote Content-Disposition/browser behavior may retain archive filenames and multiple downloads may prompt for permission.
- PREFERRED UX: One-click multi-file download with friendly names (ZIP or equivalent) if feasible. Investigate a safe streaming backend/proxy or archive-supported packaging; do not claim browser-only ZIP can work until CORS, memory limits, file size, bandwidth and archive terms are verified. Never route massive files through PHP memory buffers or silently consume site hosting quota.
- If browser-direct original downloads cannot be renamed reliably, make that limitation explicit and provide a verified alternative. Keep PowerShell and shell scripts optional for advanced users, not mandatory.
- Distinguish original archive products from extracted Siril-ready SCI images. Do not promise direct browser download of processed SCI products until extraction and download behavior are end-to-end tested.
- Keep public downloader offline until user acceptance and approval.
