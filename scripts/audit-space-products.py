#!/usr/bin/env python3
"""Audit indexed MAST observations for downloadable calibrated science FITS.

This is a *metadata* check, not image/pixel or channel-alignment verification.
Only product-confirmed is reported. No target is marked FITS-verified.
"""
import argparse
import datetime
import json
import pathlib
import re
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
INDEX = ROOT / "assets/data/space-target-index.json"
OUTPUT = ROOT / "assets/data/space-product-audit.json"
API = "https://mast.stsci.edu/api/v0/invoke"
VALID_SUFFIX = ("_drc.fits", "_drz.fits", "_i2d.fits", "_cal.fits", "_rate.fits")
COMBINED_SUFFIX = ("_drc.fits", "_drz.fits", "_i2d.fits")

def fetch_products(obsids):
    payload = {"service": "Mast.Caom.Products", "params": {"obsid": obsids},
               "format": "json", "pagesize": 5000, "page": 1}
    body = urllib.parse.urlencode({"request": json.dumps(payload)}).encode("utf-8")
    req = urllib.request.Request(API, data=body,
                                 headers={"User-Agent": "OurAstroJourney-product-audit/1.0"})
    with urllib.request.urlopen(req, timeout=90) as response:
        return json.load(response).get("data") or []

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--targets", type=int, default=12)
    p.add_argument("--observations", type=int, default=12)
    args = p.parse_args()
    if not 1 <= args.targets <= 100 or not 1 <= args.observations <= 40:
        p.error("targets must be 1..100 and observations 1..40")
    index = json.loads(INDEX.read_text(encoding="utf-8"))
    if index.get("schemaVersion", 0) < 2:
        raise SystemExit("Index lacks observation IDs. Run target index refresh first.")
    audited = []
    # Prioritise recognisable objects over calibration fields and anonymous pointings.
    familiar = re.compile(r"^(?:M(?:ESSIER)?[-_ ]?\\d+|NGC[-_ ]?\\d+|IC[-_ ]?\\d+|ORION|CARINA|PILLARS)", re.I)
    candidates = [t for t in index["targets"] if familiar.match(t["name"])]
    # The bounded archive slice can contain very few familiar names. Fall back
    # to other non-calibration targets rather than auditing just one field.
    candidates += [t for t in index["targets"] if not familiar.match(t["name"])]
    for target in candidates:
        observations = target.get("observations") or []
        ids = list(dict.fromkeys(str(o["obsid"]) for o in observations
                                 if str(o.get("obsid", "")).isdigit()))[:args.observations]
        if not ids:
            continue
        try:
            rows = fetch_products(ids)
        except (OSError, ValueError) as exc:
            print("MAST product lookup failed for", target["name"], ":", exc)
            continue
        products = []
        for row in rows:
            name = str(row.get("productFilename") or "")
            if (str(row.get("productType") or "").upper() != "SCIENCE" or
                    not name.lower().endswith(VALID_SUFFIX) or
                    not row.get("dataURI")):
                continue
            products.append({"filename": name, "obsid": str(row.get("obsID") or ""),
                             "dataURI": str(row["dataURI"]),
                             "combined": name.lower().endswith(COMBINED_SUFFIX),
                             "sizeBytes": row.get("size")})
        audited.append({"name": target["name"], "observationsChecked": len(ids),
                        "scienceFitsProducts": len(products),
                        "combinedFitsProducts": sum(x["combined"] for x in products),
                        "status": "product-confirmed" if products else "no-products-in-sample",
                        "fitsVerified": False, "products": products[:60]})
        if len(audited) >= args.targets:
            break
    result = {"schemaVersion": 1, "generatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
              "indexGeneratedAt": index.get("generatedAt"),
              "coverage": {"targetsChecked": len(audited), "sampleOnly": True},
              "warning": "Product metadata only. No pixel coverage, complete-image quality, WCS alignment or Siril usability has been verified.",
              "targets": audited}
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print("Audited", len(audited), "targets. No FITS packages marked verified.")

if __name__ == "__main__":
    main()
