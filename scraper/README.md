# voleats-scraper

Scrapes **today's** menus for UTK's Rocky Top and Stokely dining halls and returns clean JSON: stations, meal periods, full nutrition, allergens, vegan/vegetarian flags and ingredients.

It has no dependencies and needs **Node 18+**. Run it server-side only: browsers can't fetch `dining.utk.edu` directly because of CORS.

## How it works

UTK's vendor pages (`/vendor/rocky-top-dining-hall/`, `/vendor/stokely-dining-hall/`) embed the day's menu as HTML-escaped JSON in a `data-data="…"` attribute on the `#sm-dynamic-menu` element. The scraper downloads the page, finds the `data-data` attribute that contains `"subLocations"`, decodes it, and flattens it into one list of items.

## Three ways to use it

### 1. Command line: write JSON files
```bash
node cli.js                    # -> data/rockytop.json, data/stokely.json
node cli.js rockytop           # one hall
node cli.js --out ../public    # write somewhere else (e.g. a frontend's public folder)
```
Exits with code 1 if any hall fails, so it's safe to use in cron jobs and CI.

### 2. Library: import it in a backend
```js
import { scrapeHall, scrapeAll, groupByPeriodAndStation } from "./scraper/index.js";
// or, after `npm install ./scraper`:  import { scrapeHall } from "voleats-scraper";

const menu = await scrapeHall("rockytop");     // HallMenu
const all  = await scrapeAll();                // { rockytop, stokely } — errors per hall, never throws
const view = groupByPeriodAndStation(menu);    // { Dinner: { Grill: [...], ... }, ... }
```
TypeScript types are in `index.d.ts`. `parseMenuHtml(html, hall)` is a pure function you can use in tests.

To use it in a serverless function (Vercel, Netlify, etc.):
```js
import { scrapeHall } from "../scraper/index.js";
export default async function handler(req, res) {
  const menu = await scrapeHall(req.query.hall ?? "rockytop");
  res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate=3600");
  res.json(menu);
}
```

### 3. HTTP API: for a frontend
```bash
node server.js          # PORT=3001 by default; CACHE_MS=600000 (10 min) by default
```
| Endpoint | Returns |
|---|---|
| `GET /menu` | `{ rockytop: HallMenu, stokely: HallMenu }` |
| `GET /menu/rockytop` | `HallMenu` |
| `GET /menu/stokely` | `HallMenu` |
| `?refresh=1` | Skips the cache |

CORS is open (`*`), so a frontend can fetch it directly:
```js
const menu = await fetch("http://localhost:3001/menu/rockytop").then(r => r.json());
```

## Output shape (`HallMenu`)
```jsonc
{
  "hallId": "rockytop",
  "hall": "Rocky Top Dining Hall",
  "serviceAreaId": 125621,
  "source": "https://dining.utk.edu/vendor/rocky-top-dining-hall/",
  "date": "2026-11-13",                 // UTK server date
  "scrapedAt": "2026-11-13T20:15:02.000Z",
  "itemCount": 278,
  "items": [
    {
      "id": "72662",
      "name": "Assorted Bagels",
      "station": "Bakery",
      "period": "Breakfast",
      "description": "Sliced Assorted Bagels",
      "serving": "1 slice",
      "nutrition": { "calories": 40, "protein": 1.3, "total_fat": 0.5, "sodium": 73 /* … */ },
      "vegan": false,
      "vegetarian": false,
      "contains": { "milk": false, "gluten": true, "sesame": true, "soy": null /* … */ },
      "ingredients": "Bagel (POPPY BAGEL- …"
    }
  ]
}
```
Nutrition values are numbers in the units UTK uses: grams for fat, carbohydrate and protein; milligrams for sodium, cholesterol, calcium, iron and potassium. In `vegan`, `vegetarian` and `contains`, `null` means UTK lists the value as "Unknown".

## Limitations
- **Today only.** The vendor page only includes the current day's menu.
- **UTK's data has errors.** For example, "Sugar Cookie" is listed at 19,010 calories, which looks like a whole-batch value. Items are passed through as published.
- **Depends on the page structure.** If UTK changes the page, `scrapeHall` throws a `ScraperError` saying "Menu data not found" instead of returning an empty menu.
- Add another hall by adding an entry to `HALLS` in `index.js`, with its vendor page URL.
