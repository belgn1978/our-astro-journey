#!/usr/bin/env python3
"""Build a release-first MAST lookup queue from documented published images.

Only uses curated, attributed releases. This does NOT verify science FITS.
"""
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
source = root / "assets/data/space-image-catalogue.json"
destination = root / "assets/data/space-release-match-queue.json"

def main():
    releases = json.loads(source.read_text(encoding="utf-8"))["images"]
    queue = []
    for image in releases:
        programme = str(image.get("programme") or "").strip()
        mission = image.get("telescope")
        if not programme or mission not in ("HST", "JWST"):
            continue
        coordinates = image.get("coordinates") or {}
        filters = [str(f["name"]).upper() for f in image.get("filters", []) if f.get("name")]
        queue.append({
            "releaseId": image["id"],
            "title": image["title"],
            "mission": mission,
            "programme": programme,
            "instrument": image.get("instrument"),
            "publishedFilters": filters,
            "coordinates": coordinates,
            "releaseUrl": image.get("releaseUrl"),
            "status": "awaiting-mast-match",
            "fitsVerified": False,
            "matchRules": {
                "requireProgramme": True,
                "requireInstrument": True,
                "requireScienceFITS": True,
                "requireTargetPixelCoverage": True,
                "requireChannelOverlap": True
            }
        })
    destination.write_text(json.dumps({
        "schemaVersion": 1,
        "policy": "Published release metadata is a starting point, not proof of MAST product or image coverage.",
        "releaseCount": len(queue),
        "releases": queue
    }, indent=2) + "\n", encoding="utf-8")
    print("Prepared", len(queue), "published releases for MAST matching.")

if __name__ == "__main__":
    main()
