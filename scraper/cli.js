#!/usr/bin/env node
// Writes data/rockytop.json and data/stokely.json (inside this folder).
//
// Usage:
//   node cli.js                  # all halls -> ./data
//   node cli.js rockytop         # one hall
//   node cli.js --out ../public  # custom output folder

import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { HALL_IDS, scrapeHall } from "./index.js";

const args = process.argv.slice(2);
const outFlag = args.indexOf("--out");
const outDir =
  outFlag !== -1
    ? resolve(process.cwd(), args[outFlag + 1])
    : fileURLToPath(new URL("./data/", import.meta.url));
const halls = args.filter(
  (a, i) => !a.startsWith("--") && (outFlag === -1 || i !== outFlag + 1),
);
const targets = halls.length ? halls : HALL_IDS;

await mkdir(outDir, { recursive: true });

let failed = 0;
for (const id of targets) {
  try {
    const menu = await scrapeHall(id);
    const file = resolve(outDir, `${id}.json`);
    await writeFile(file, JSON.stringify(menu, null, 2));
    console.log(`✓ ${menu.hall}: ${menu.itemCount} items (${menu.date}) -> ${file}`);
  } catch (err) {
    failed++;
    console.error(`✗ ${id}: ${err.message}`);
  }
}
process.exit(failed ? 1 : 0);
