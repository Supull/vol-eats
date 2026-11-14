#!/usr/bin/env node
// Builds mock/menu-items.generated.json from the real scraper output, so the
// mock dining hall menus are actual UTK food. Re-run after a fresh scrape:
//   npm run mock:menus
// Picks up to 11 items per meal period per hall (~30 per hall), favoring real entrees.

import { readFile, writeFile } from "node:fs/promises";

const HALLS = [
  { file: "scraper/data/rockytop.json", location_id: "loc-rockytop" },
  { file: "scraper/data/stokely.json", location_id: "loc-stokely" },
];

const PER_PERIOD = 11;
// Earlier = picked first. Toppings/condiment stations are excluded.
const STATION_PRIORITY = [
  "Entree", "Grill", "True Balance", "Tex Mex", "Omelet", "Pasta", "Vegan",
  "Oven", "Soup", "Pasta Build Your Own", "Waffle Bar", "Produce Market", "Bakery",
];
const SKIP_STATION = /topping|upon request|condiment|dressing/i;
const ALLERGENS = ["milk", "eggs", "fish", "shellfish", "tree_nuts", "peanut", "wheat", "gluten", "soy", "sesame"];

function tagsFor(item) {
  const c = item.contains ?? {};
  const tags = [];
  if (item.vegan) tags.push("vegan", "vegetarian");
  else if (item.vegetarian) tags.push("vegetarian");
  if (c.gluten === false && c.wheat === false) tags.push("gluten_free");
  if (c.milk === false) tags.push("dairy_free");
  return tags;
}

function plausible(item) {
  const n = item.nutrition ?? {};
  // UTK data has whole-batch values (e.g. 19,010 kcal cookie); drop those.
  return n.calories > 20 && n.calories < 1500 && n.protein != null && n.carbohydrate != null && n.total_fat != null;
}

const out = [];
for (const hall of HALLS) {
  const menu = JSON.parse(await readFile(hall.file, "utf8"));
  for (const period of ["Breakfast", "Lunch", "Dinner"]) {
    const candidates = menu.items
      .filter((i) => i.period === period && !SKIP_STATION.test(i.station) && plausible(i))
      .sort((a, b) => {
        const rank = (s) => {
          const r = STATION_PRIORITY.indexOf(s);
          return r === -1 ? 99 : r;
        };
        return rank(a.station) - rank(b.station) || b.nutrition.protein - a.nutrition.protein;
      });

    // Round-robin across stations so one station doesn't take every slot.
    const byStation = new Map();
    for (const c of candidates) {
      if (!byStation.has(c.station)) byStation.set(c.station, []);
      byStation.get(c.station).push(c);
    }
    const picked = [];
    const seen = new Set();
    while (picked.length < PER_PERIOD && [...byStation.values()].some((q) => q.length)) {
      for (const q of byStation.values()) {
        const next = q.shift();
        if (next && !seen.has(next.name) && picked.length < PER_PERIOD) {
          seen.add(next.name);
          picked.push(next);
        }
      }
    }

    for (const i of picked) {
      out.push({
        id: `${hall.location_id}-${i.id}-${period.toLowerCase()}`,
        location_id: hall.location_id,
        date: null, // the mock API stamps today's date
        meal_period: period.toLowerCase(),
        station: i.station,
        name: i.name,
        serving_size: i.serving,
        calories: Math.round(i.nutrition.calories),
        protein_g: Math.round(i.nutrition.protein),
        carbs_g: Math.round(i.nutrition.carbohydrate),
        fat_g: Math.round(i.nutrition.total_fat),
        tags: tagsFor(i),
        allergens: ALLERGENS.filter((a) => i.contains?.[a] === true),
      });
    }
  }
}

await writeFile("mock/menu-items.generated.json", JSON.stringify(out, null, 2) + "\n");
const count = (loc) => out.filter((i) => i.location_id === loc).length;
console.log(`Wrote ${out.length} items (Rocky Top ${count("loc-rockytop")}, Stokely ${count("loc-stokely")})`);
