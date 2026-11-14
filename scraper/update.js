#!/usr/bin/env node
// Scrapes every hall and only writes files when the menu actually changed.
//
//   data/rockytop.json                    latest menu (overwritten on change)
//   data/stokely.json
//   data/history/rockytop-YYYY-MM-DD.json  one snapshot per day (last version that day)
//   data/history/stokely-YYYY-MM-DD.json
//
// Safe to run as often as you like (cron, GitHub Actions, etc.).
// In GitHub Actions it sets the step output `changed=true|false`.
//
// Usage:  node update.js

import { mkdir, readFile, writeFile, appendFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { HALL_IDS, scrapeHall } from "./index.js";

const dataDir = new URL("./data/", import.meta.url);
const historyDir = new URL("./data/history/", import.meta.url);

// Fingerprint only the menu content, not scrapedAt, so re-scraping an
// unchanged menu doesn't count as a change.
function fingerprint(menu) {
  return createHash("sha256")
    .update(JSON.stringify({ date: menu.date, items: menu.items }))
    .digest("hex");
}

async function readExisting(id) {
  try {
    return JSON.parse(await readFile(new URL(`${id}.json`, dataDir), "utf8"));
  } catch {
    return null; // first run, or unreadable file
  }
}

await mkdir(historyDir, { recursive: true });

const changed = [];
let failed = 0;

for (const id of HALL_IDS) {
  try {
    const menu = await scrapeHall(id);
    if (menu.itemCount === 0) throw new Error("scraped 0 items, keeping previous file");

    const previous = await readExisting(id);
    if (previous && fingerprint(previous) === fingerprint(menu)) {
      console.log(`= ${menu.hall}: unchanged (${menu.date}, ${menu.itemCount} items)`);
      continue;
    }

    const json = JSON.stringify(menu, null, 2);
    await writeFile(new URL(`${id}.json`, dataDir), json);
    await writeFile(new URL(`${id}-${menu.date ?? "unknown"}.json`, historyDir), json);
    changed.push(id);
    console.log(`✓ ${menu.hall}: UPDATED (${menu.date}, ${menu.itemCount} items)`);
  } catch (err) {
    failed++;
    console.error(`✗ ${id}: ${err.message}`);
  }
}

if (process.env.GITHUB_OUTPUT) {
  await appendFile(process.env.GITHUB_OUTPUT, `changed=${changed.length > 0}\n`);
}

console.log(changed.length ? `Changed: ${changed.join(", ")}` : "No changes.");
// Only fail the run if every hall failed (so partial updates still get saved).
process.exit(failed === HALL_IDS.length ? 1 : 0);
