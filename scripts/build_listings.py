#!/usr/bin/env python3
"""Rebuild data/listings.json from the public H.A.Y. Lincolnshire WordPress API.

Run by .github/workflows/refresh-listings.yml every night, or by hand:
    python3 scripts/build_listings.py
Standard library only. Writes one shared file used by every lot page.
Deliberately keeps no phone numbers, emails or websites: each listing links to H.A.Y.
for contact details. Which lot a listing belongs to is worked out in the browser
from shared/data/lots.json, so areas can change without a rebuild.
"""
import datetime, html, json, re, sys, time, urllib.request
from pathlib import Path

API = "https://haylincolnshire.co.uk/wp-json/wp/v2"
OUT = Path(__file__).resolve().parent.parent / "shared" / "data" / "listings.json"
UA = "NorthRuralFinder/1.0 (Bridge Community Connector; contact via wearebridge.org)"
FIELDS = "id,date,modified,link,title,acf,life_stage,categories,support_categories"


def get(url, tries=3):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.load(r), r.headers
        except Exception as e:  # network blip: back off and retry
            if i == tries - 1:
                raise
            print(f"retry {url}: {e}", file=sys.stderr)
            time.sleep(5 * (i + 1))


def all_pages(path):
    items, page = [], 1
    while True:
        data, hdr = get(f"{API}/{path}{'&' if '?' in path else '?'}per_page=100&page={page}")
        items += data
        if page >= int(hdr.get("X-WP-TotalPages", 1)):
            return items
        page += 1
        time.sleep(1)  # be polite


def terms(tax):
    return {t["id"]: html.unescape(t["name"]) for t in all_pages(f"{tax}?_fields=id,name")}


def miles(a, b, c, d):
    from math import asin, cos, radians, sin, sqrt
    return 2 * 3958.8 * asin(sqrt(sin(radians(c - a) / 2) ** 2 + cos(radians(a)) * cos(radians(c)) * sin(radians(d - b) / 2) ** 2))


def short(s, n=260):
    """Keep only a short summary; the full description stays on H.A.Y."""
    return s if len(s) <= n else s[: n - 3].rsplit(" ", 1)[0] + "..."


def text(s):
    s = re.sub(r"<[^>]+>", " ", s or "")
    return re.sub(r"\s+", " ", html.unescape(s)).strip()


def main():
    old = json.loads(OUT.read_text(encoding="utf-8"))
    cat_names = {**terms("categories"), **terms("support_categories")}
    life = terms("life_stage")

    listings = []
    for kind, path, catkey in (("Activity", "activities", "categories"), ("Support", "support", "support_categories")):
        for p in all_pages(f"{path}?_fields={FIELDS}"):
            acf = p.get("acf") or {}
            locs, cw = [], False
            for l in acf.get("locations") or []:
                a = (l or {}).get("address") or {}
                addr = text(a.get("address"))
                if not addr or a.get("lat") is None:
                    continue
                if re.search(r"countywide|county-wide|^lincolnshire,?\s*(uk)?$", addr, re.I):
                    cw = True  # a county-wide service, not a real place
                    continue
                la, ln = float(a["lat"]), float(a["lng"])
                locs.append({"a": addr, "la": round(la, 5), "ln": round(ln, 5)})
            listings.append({
                "t": kind,
                "n": text(p["title"]["rendered"]),
                "u": p["link"],
                "c": p["date"][:10],
                "m": p["modified"][:10],
                "d": short(text(acf.get("description"))),
                "cat": sorted({cat_names[i] for i in p.get(catkey) or [] if i in cat_names}),
                "ls": [life[i] for i in p.get("life_stage") or [] if i in life],
                "cw": cw,
                "loc": locs,
            })

    if len(listings) < 0.8 * len(old["listings"]):
        sys.exit(f"Only {len(listings)} listings fetched (was {len(old['listings'])}); not overwriting.")
    listings.sort(key=lambda o: (o["m"], o["n"]), reverse=True)
    out = {"snapshot": datetime.date.today().isoformat(), "listings": listings}
    OUT.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"Wrote {len(listings)} listings.")


if __name__ == "__main__":
    main()
