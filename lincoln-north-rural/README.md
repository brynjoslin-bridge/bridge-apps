# What's on in Lincoln North Rural

A static finder for local groups, activities and support across the Lincoln North Rural villages, built from H.A.Y. Lincolnshire listings. Runs entirely on GitHub Pages: no server, no build step.

## Files

| Path | What it is |
|---|---|
| `index.html` | The page |
| `assets/style.css` | Styles, built on the Bridge design system (teal, navy, cream; Poppins and Dancing Script) |
| `assets/fonts/`, `assets/img/` | Self-hosted brand fonts and the Bridge wordmark |
| `assets/app.js` | Search, filters, map and postcode lookup |
| `data/listings.json` | The H.A.Y. listings, rebuilt every night by the GitHub Action |
| `data/categories.json` | Bridge's own category tree (max 7 choices per level). Edit this to move or rename categories |
| `scripts/build_listings.py` | Pulls listings from the public H.A.Y. API and writes `data/listings.json` |
| `.github/workflows/refresh-listings.yml` | Runs the script nightly and publishes any changes |
| `data/postcode-areas.json`, `data/postcodes.json` | Fallback Lincolnshire postcode table, used only if postcodes.io can't be reached |
| `data/basemap.json` | Fallback outline map, used only if map tiles can't load |
| `.nojekyll` | Tells GitHub Pages to serve the files as-is |

## Publish on GitHub Pages

1. In the repository, choose **Add file > Upload files** and drag in everything in this folder (keep the `assets` and `data` folders as folders). Commit.
   - To publish under a sub-path (for example `/north-rural-finder/`), upload the folder itself instead. All links are relative, so it works at any path.
2. **Settings > Pages > Build and deployment**: Source = *Deploy from a branch*, Branch = `main`, folder = `/ (root)`. Save.
3. After a minute or two the site is live at `https://<org>.github.io/<repo>/`.

Note: opening `index.html` straight from your computer will not load the data (browsers block `fetch` from `file://`). To test locally run `python3 -m http.server` in this folder and visit `http://localhost:8000`.

## Live data from H.A.Y.

The GitHub Action in `.github/workflows/refresh-listings.yml` runs every night at about 4am UK time. It calls the public H.A.Y. Lincolnshire WordPress API (`haylincolnshire.co.uk/wp-json/wp/v2/activities` and `/support`), rebuilds `data/listings.json`, commits it, and GitHub Pages republishes the site.

- **First run:** go to the **Actions** tab, choose *Refresh H.A.Y. listings*, then **Run workflow**.
- **If it fails:** GitHub emails the repo owner. The site keeps showing the last good data. The script refuses to save if it gets back far fewer listings than before.
- **If Actions can't push:** Settings > Actions > General > Workflow permissions > *Read and write permissions*.
- **Uploading via the web:** the `.github` folder is hidden on a Mac. If it doesn't upload, use **Add file > Create new file**, name it `.github/workflows/refresh-listings.yml` and paste the file contents in.

## Categories

`data/categories.json` holds Bridge's own category tree. Each level has at most 7 choices; a leaf lists the H.A.Y. categories that sit inside it. Categories with no listings (after the other filters) are hidden.

When H.A.Y. adds a category that isn't in the tree, its listings appear under **Other** until you add it to `categories.json`. "Other" only shows when it has something in it.

## Outside services

- Map tiles: OpenStreetMap (`tile.openstreetmap.org`), fine for light community use under the OSM tile usage policy. If traffic grows, switch to a hosted tile provider in `assets/app.js`.
- Postcode lookup: postcodes.io (free, no key, ONS data under the OGL).
- Leaflet 1.9.4 from cdnjs. Fonts are self-hosted, so there is no Google Fonts call.

Not affiliated with or endorsed by H.A.Y. Lincolnshire. Listing content belongs to H.A.Y. Lincolnshire and its providers; each entry links back to the original.
