# What's on in Lincoln North Rural

A static finder for local groups, activities and support across the Lincoln North Rural villages, built from H.A.Y. Lincolnshire listings. Runs entirely on GitHub Pages: no server, no build step.

## Files

| Path | What it is |
|---|---|
| `index.html` | The page |
| `assets/style.css` | Styles (light and dark mode) |
| `assets/app.js` | Search, filters, map and postcode lookup |
| `data/listings.json` | The H.A.Y. listings snapshot. **This is the file you replace to refresh the data.** |
| `data/postcode-areas.json`, `data/postcodes.json` | Fallback Lincolnshire postcode table, used only if postcodes.io can't be reached |
| `data/basemap.json` | Fallback outline map, used only if map tiles can't load |
| `.nojekyll` | Tells GitHub Pages to serve the files as-is |

## Publish on GitHub Pages

1. In the repository, choose **Add file > Upload files** and drag in everything in this folder (keep the `assets` and `data` folders as folders). Commit.
   - To publish under a sub-path (for example `/north-rural-finder/`), upload the folder itself instead. All links are relative, so it works at any path.
2. **Settings > Pages > Build and deployment**: Source = *Deploy from a branch*, Branch = `main`, folder = `/ (root)`. Save.
3. After a minute or two the site is live at `https://<org>.github.io/<repo>/`.

Note: opening `index.html` straight from your computer will not load the data (browsers block `fetch` from `file://`). To test locally run `python3 -m http.server` in this folder and visit `http://localhost:8000`.

## Refresh the listings

Replace `data/listings.json` with a new export in the same shape (`snapshot` date, `villages`, `listings`) and commit. The "listings checked" date in the header reads from `snapshot`, and the freshness colours are calculated against it.

## Outside services

- Map tiles: OpenStreetMap (`tile.openstreetmap.org`), fine for light community use under the OSM tile usage policy. If traffic grows, switch to a hosted tile provider in `assets/app.js`.
- Postcode lookup: postcodes.io (free, no key, ONS data under the OGL).
- Leaflet 1.9.4 and Google Fonts from their CDNs.

Not affiliated with or endorsed by H.A.Y. Lincolnshire. Listing content belongs to H.A.Y. Lincolnshire and its providers; each entry links back to the original.
