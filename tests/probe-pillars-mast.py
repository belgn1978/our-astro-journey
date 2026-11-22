#!/usr/bin/env python3
"""Non-deploying MAST FITS header and science-pixel diagnostic for Hubble Pillars."""
import math
import struct
import urllib.parse
import urllib.request

FILTERS = ("f502n", "f657n", "f673n")
ROOT = "https://mast.stsci.edu/api/v0.1/Download/file?uri="


def read_range(url, start, length):
    req = urllib.request.Request(
        url,
        headers={"Range": f"bytes={start}-{start + length - 1}", "User-Agent": "OurAstroJourney-FITS-probe/2"},
    )
    with urllib.request.urlopen(req, timeout=25) as response:
        payload = response.read(length + 1)
        if response.status != 206 or len(payload) != length:
            raise ValueError(f"Invalid byte range response: {response.status}, {len(payload)} bytes")
        return payload


def parse_header(data, offset):
    fields = {}
    for index in range(offset, len(data) - 79, 80):
        card = data[index:index + 80].decode("ascii", "replace")
        key = card[:8].strip()
        if key == "END":
            return fields, ((index + 80 + 2879) // 2880) * 2880
        if card[8:10] == "= ":
            raw = card[10:].strip()
            if raw.startswith("'"):
                fields[key] = raw.split("'", 2)[1].strip()
            else:
                fields[key] = raw.split("/", 1)[0].strip()
    raise ValueError("FITS END card not found in fetched header")


def plane_size(fields):
    axes = int(fields.get("NAXIS", 0))
    count = 0 if axes == 0 else math.prod(int(fields[f"NAXIS{i}"]) for i in range(1, axes + 1))
    return (count + int(fields.get("PCOUNT", 0))) * int(fields.get("GCOUNT", 1)) * abs(int(fields["BITPIX"])) // 8


def inspect(flt):
    filename = f"hst_13926_06_wfc3_uvis_{flt}_ick906_drc.fits"
    uri = "mast:HST/product/" + filename
    url = ROOT + urllib.parse.quote(uri, safe="")
    data = read_range(url, 0, 262144)
    primary, end = parse_header(data, 0)
    offset = end + ((plane_size(primary) + 2879) // 2880) * 2880
    science = None
    for _ in range(8):
        header, data_start = parse_header(data, offset)
        if header.get("EXTNAME", "").upper() == "SCI" or (offset == 0 and int(header.get("NAXIS", 0)) == 2):
            science = (header, data_start)
            break
        offset = data_start + ((plane_size(header) + 2879) // 2880) * 2880
        if offset >= len(data):
            break
    if science is None:
        raise ValueError("No SCI extension in first 256 KiB")
    header, data_start = science
    combined = {**primary, **header}
    print(f"{flt.upper()} telescope={combined.get('TELESCOP')} instrument={combined.get('INSTRUME')} "
          f"FILTER={combined.get('FILTER')} FILTER1={combined.get('FILTER1')} FILTER2={combined.get('FILTER2')} "
          f"SCI={combined.get('NAXIS1')}x{combined.get('NAXIS2')} BITPIX={combined.get('BITPIX')} "
          f"CRVAL=({combined.get('CRVAL1')},{combined.get('CRVAL2')}) "
          f"CTYPE=({combined.get('CTYPE1')},{combined.get('CTYPE2')}) "
          f"SCI-start={data_start}")
    if int(combined["NAXIS1"]) < 100 or int(combined["NAXIS2"]) < 100:
        raise ValueError("Unexpectedly small SCI image")
    if not str(combined.get("CTYPE1", "")).startswith("RA---") or not str(combined.get("CTYPE2", "")).startswith("DEC--"):
        raise ValueError("Missing sky WCS")
    if flt.upper() not in (combined.get("FILTER", ""), combined.get("FILTER1", ""), combined.get("FILTER2", ""), combined.get("FILTNAM1", ""), combined.get("FILTNAM2", "")):
        raise ValueError("Expected filter absent from FITS header")
    bitpix = int(combined["BITPIX"])
    if bitpix == -32:
        pixels = read_range(url, data_start + 4 * (int(combined["NAXIS1"]) * int(combined["NAXIS2"]) // 2), 256)
        values = struct.unpack(">64f", pixels)
        finite = [x for x in values if math.isfinite(x)]
        print(f"{flt.upper()} midplane 64 pixels: finite={len(finite)} nonzero={sum(x != 0 for x in finite)}")
    return combined


def main():
    records = [inspect(flt) for flt in FILTERS]
    dimensions = {(r["NAXIS1"], r["NAXIS2"]) for r in records}
    print("Matching SCI dimensions:", len(dimensions) == 1)
    # Inspect the *actual* WCS at the published 2015 Pillars position.
    # Matching NAXIS dimensions and overlapping bounding boxes do not imply
    # matching pixel grids. Astropy applies SIP distortion if present.
    from astropy.wcs import WCS
    from astropy.io import fits
    from astropy.coordinates import SkyCoord
    import astropy.units as u
    target = SkyCoord("18h18m52.72s", "-13d50m21.97s", frame="icrs")
    grids = []
    for record in records:
        header = fits.Header()
        for key, raw in record.items():
            if len(key) > 8 or not key:
                continue
            try:
                header[key] = int(raw) if str(raw).lstrip("+-").isdigit() else float(raw)
            except (ValueError, TypeError):
                header[key] = raw
        grids.append(WCS(header, naxis=2))
    centres = []
    for flt, record, wcs in zip(FILTERS, records, grids):
        x, y = wcs.world_to_pixel(target)
        inside = 0 <= x < int(record["NAXIS1"]) and 0 <= y < int(record["NAXIS2"])
        centres.append((x, y))
        print(f"Pillars sky position in {flt.upper()}: x={x:.2f} y={y:.2f} inside={inside}")
        if not inside:
            raise ValueError(f"{flt}: published Pillars position falls outside SCI image")
    for i in range(1, len(grids)):
        delta = math.dist(centres[0], centres[i])
        print(f"WCS pixel offset at Pillars F502N -> {FILTERS[i].upper()}: {delta:.3f} pixels")
        # Evaluate local sky positions too: identical centres can hide
        # rotation, scale or nonlinear distortion differences.
        for dx, dy in ((-700, 0), (700, 0), (0, -700), (0, 700)):
            sky = grids[0].pixel_to_world(centres[0][0] + dx, centres[0][1] + dy)
            x2, y2 = grids[i].world_to_pixel(sky)
            local = math.dist((x2, y2), (centres[0][0] + dx, centres[0][1] + dy))
            print(f"  local displacement at ({dx:+d},{dy:+d}): {local:.3f} pixels")
    print("WCS diagnostic complete; inspect offsets before claiming images are co-registered.")



if __name__ == "__main__":
    main()
