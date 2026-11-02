#!/usr/bin/env python3
"""Build a bounded, auditable HST/JWST target index from STScI MAST metadata.

Run: python3 scripts/build-space-target-index.py --pages 4 --page-size 500
No images or FITS are downloaded. This is an *observation* index, not verified
processing packages. Repeated runs rebuild deterministically from the API.
"""
import argparse
import collections
import datetime
import json
import pathlib
import re
import urllib.parse
import urllib.request

API = "https://mast.stsci.edu/api/v0/invoke"
OUTPUT = pathlib.Path(__file__).resolve().parents[1] / "assets/data/space-target-index.json"
BAD = re.compile(r"^(?:UNKNOWN|NONE|NULL|ANY|PARALLEL|CALIB|DARK|FLAT|BIAS|TEST|SKY|BACKGROUND|WAVEFRONT|FOCUS|TBD|N/A|UNNAMED|STAR)$", re.I)

def request(page, page_size, mission):
    query = {
        "service": "Mast.Caom.Filtered",
        "params": {"columns": "obsid,obs_collection,target_name,proposal_id,dataproduct_type,dataRights,calib_level,filters,instrument_name,s_ra,s_dec",
                   "filters": [
                       {"paramName": "obs_collection", "values": [mission]},
                       {"paramName": "dataproduct_type", "values": ["image"]},
                       {"paramName": "dataRights", "values": ["PUBLIC"]}
                   ]},
        "format": "json", "pagesize": page_size, "page": page, "timeout": 60
    }
    url = API + "?request=" + urllib.parse.quote(json.dumps(query, separators=(",", ":")))
    with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "OurAstroJourney-target-index/1.0"}), timeout=90) as res:
        payload = json.load(res)
    if payload.get("status") not in (None, "COMPLETE", "EXECUTING"):
        raise RuntimeError("MAST returned " + str(payload.get("status")))
    return payload.get("data") or []

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--pages", type=int, default=4)
    parser.add_argument("--page-size", type=int, default=500)
    args = parser.parse_args()
    if not (1 <= args.pages <= 40 and 1 <= args.page_size <= 2000):
        parser.error("pages must be 1..40; page-size 1..2000")
    groups = {}
    total = 0
    for mission in ("HST", "JWST"):
        for page in range(1, args.pages + 1):
            rows = request(page, args.page_size, mission)
            total += len(rows)
            for obs in rows:
                name = str(obs.get("target_name") or "").strip()
                if not name or len(name) > 100 or BAD.match(name):
                    continue
                key = name.casefold()
                g = groups.setdefault(key, {"name": name, "missions": set(), "programmes": set(), "filters": set(), "observationCount": 0})
                g["missions"].add(mission)
                if obs.get("proposal_id") is not None:
                    g["programmes"].add(str(obs["proposal_id"]))
                g["filters"].update(str(obs.get("filters") or "").replace(",", ";").split(";"))
                g["observationCount"] += 1
            if len(rows) < args.page_size:
                break
    targets = []
    for g in groups.values():
        targets.append({"name": g["name"], "missions": sorted(g["missions"]),
                        "programmes": sorted(g["programmes"])[:20],
                        "filters": sorted(f.strip() for f in g["filters"] if f.strip())[:30],
                        "observationCount": g["observationCount"],
                        "status": "observation-indexed",
                        "fitsVerified": False})
    targets.sort(key=lambda x: (-x["observationCount"], x["name"].casefold()))
    result = {"schemaVersion": 1, "generatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
              "coverage": {"pagesPerMission": args.pages, "pageSize": args.page_size,
                           "observationsScanned": total, "completeArchive": False},
              "policy": "Observation metadata only. Do not label any target FITS-verified without pixel/WCS and product validation.",
              "targets": targets}
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Indexed {len(targets)} names from {total} observations. This is not a complete archive or verified FITS inventory.")

if __name__ == "__main__":
    main()
