# What's on near you: Community Connector finders

One shared data set, one page per area. Every listing comes from, and links to, H.A.Y. Lincolnshire. The site holds **no phone numbers, emails or websites**; people click through to H.A.Y. for times and contact details.

## Layout

| Path | What it is |
|---|---|
| `index.html` | Landing page: choose your area |
| `lincoln-north-rural/`, `lincoln-north/`, `lincoln-city/`, `south-lincoln/`, `sleaford/` | One small page per area. Each only says which area it is; everything else is shared |
| `shared/assets/` | The app (`app.js`), styles, Bridge fonts and logo, used by every area |
| `shared/data/listings.json` | All H.A.Y. listings for Lincolnshire, pulled once a night for every area |
| `shared/data/lots.json` | **The area definitions.** Each area is a list of places (centre and radius in miles) |
| `shared/data/categories.json` | Bridge category tree (max 7 choices per level) |
| `shared/data/postcode*.json`, `basemap.json` | Fallbacks if postcodes.io or the map tiles are unavailable |
| `scripts/build_listings.py` | Pulls the H.A.Y. feed and writes `shared/data/listings.json` |
| `.github/workflows/refresh-listings.yml` | Runs the script nightly and publishes changes |

## Areas

An area shows a listing as local if any of the listing's locations falls inside one of the area's circles. Countywide services show in every area. `"include"` lets one area contain another (Lincoln North includes Lincoln North Rural). Areas marked `"status": "draft"` show a note that the boundary is still being confirmed.

To change an area, edit `shared/data/lots.json` (no rebuild needed). To add an area:

1. Add an entry to `shared/data/lots.json` with an id such as `"gainsborough"`.
2. Copy any area folder, rename it to the id, and change the id in the one line `window.FINDER={lot:"...",root:"../shared/"}` and in the `<title>`.

## Publish on GitHub Pages

Upload everything here to the **root** of the repository, keeping the folder names. The nightly workflow file must sit at `.github/workflows/refresh-listings.yml` (if the hidden `.github` folder doesn't upload, use **Add file > Create new file** and paste it in). Settings > Pages: deploy from branch `main`, folder `/ (root)`. Settings > Actions > General: workflow permissions "Read and write". Then Actions > Refresh H.A.Y. listings > Run workflow, once, to test.

Test locally with `python3 -m http.server` in this folder, then open http://localhost:8000 (opening the files directly won't load the data).

## Outside services

Map tiles: OpenStreetMap. Postcode lookup: postcodes.io (ONS data, OGL). Leaflet from cdnjs. Fonts are self-hosted.

Not affiliated with or endorsed by H.A.Y. Lincolnshire. Listing content belongs to H.A.Y. Lincolnshire and its providers.
