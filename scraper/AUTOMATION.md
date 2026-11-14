# Automated scraping

`update.js` scrapes both halls and **only writes files when the menu changed**. It compares the date and items and ignores the scrape timestamp. A GitHub Actions workflow (`.github/workflows/scrape-menus.yml` in the repo root) runs it every 2 hours and commits the JSON only when something changed.

## Files it maintains
| File | Contents |
|---|---|
| `data/rockytop.json`, `data/stokely.json` | Latest menu. Your app reads these. |
| `data/history/<hall>-YYYY-MM-DD.json` | One snapshot per day: the last version seen that day. |

## Setup (one time)
1. Push the repo to GitHub. The workflow file has to be at `.github/workflows/` in the repo root.
2. On GitHub, go to **Settings**, then **Actions**, then **General**, then **Workflow permissions**, and choose **Read and write permissions**.
3. In the **Actions** tab, open **Scrape dining menus** and click **Run workflow** to test it.

## Reading the data from an app or website
Once it's on GitHub, the latest menus are available at these URLs. They allow requests from any site, and nothing needs to be hosted:
```
https://raw.githubusercontent.com/<user>/<repo>/main/scraper/data/rockytop.json
https://raw.githubusercontent.com/<user>/<repo>/main/scraper/data/stokely.json
```
GitHub caches these for about 5 minutes. If the repo is private, these URLs won't work publicly. Host the JSON somewhere else, or use `server.js`.

## Running it manually or locally
```bash
node update.js      # prints "UPDATED" or "unchanged" for each hall
```

## Notes
- The schedule is in **UTC**. `15 */2 * * *` means 12:15 am, 2:15 am, and so on, every 2 hours. GitHub can start scheduled runs 5 to 30 minutes late.
- Each run takes under a minute. Every 2 hours comes to about 360 minutes a month, well inside GitHub's free tier, including for private repos.
- GitHub disables scheduled workflows after 60 days with no repo activity. The menu commits normally count as activity.
- If a scrape returns 0 items or fails, the previous file is kept. The run fails only if **both** halls fail.
