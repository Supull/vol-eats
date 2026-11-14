/*
 * Simple rule-based plate builder. Used by the mock AI route AND as the
 * offline fallback when the real AI route is slow or fails, so it runs on the
 * real menu data either way. Not smart: the AI route (Aarohan) replaces it.
 */
import { sumLogs } from "./macros";
import type { Macros, MenuItem, Plate, PlateItem, PlateRecommendation } from "./types";

const toPlateItem = (m: MenuItem, servings = 1): PlateItem => ({
  menu_item_id: m.id,
  name: m.name,
  servings,
  calories: m.calories,
  protein_g: m.protein_g,
  carbs_g: m.carbs_g,
  fat_g: m.fat_g,
});

/** `variant` rotates which items get picked, so "Regenerate" shows something new. */
export function buildPlates(menu: MenuItem[], remaining: Macros, variant = 0): PlateRecommendation {
  if (menu.length === 0) return { plates: [] };
  const location_id = menu[0].location_id;
  const pick = <T,>(list: T[], i: number) => (list.length ? list[(i + variant) % list.length] : undefined);

  const proteinDense = [...menu]
    .filter((m) => m.protein_g >= 8)
    .sort((a, b) => b.protein_g / Math.max(b.calories, 1) - a.protein_g / Math.max(a.calories, 1));
  // Prefer real sides over desserts/waffles when the menu has any.
  const allCarbs = [...menu].filter((m) => m.carbs_g >= 20).sort((a, b) => b.carbs_g - a.carbs_g);
  const savory = allCarbs.filter((m) => !/bakery|waffle/i.test(m.station ?? ""));
  const carbSides = savory.length ? savory : allCarbs;
  const light = [...menu].filter((m) => m.calories <= 200).sort((a, b) => b.protein_g - a.protein_g);
  const protein = proteinDense.length ? proteinDense : [...menu].sort((a, b) => b.protein_g - a.protein_g);

  const plates: Plate[] = [];
  const add = (id: string, title: string, picks: (PlateItem | undefined)[], reason: string) => {
    const items = picks.filter((p): p is PlateItem => !!p).filter((it, i, arr) => arr.findIndex((x) => x.menu_item_id === it.menu_item_id) === i);
    if (items.length) plates.push({ id: `${id}-${variant}`, title, location_id, items, totals: sumLogs(items), reason });
  };

  const main = pick(protein, 0)!;
  const proteinServings = remaining.protein_g > 50 && main.calories < 250 ? 2 : 1;
  add(
    "plate-protein",
    "High-protein plate",
    [toPlateItem(main, proteinServings), pick(protein, 1) && toPlateItem(pick(protein, 1)!), pick(carbSides, 0) && toPlateItem(pick(carbSides, 0)!)],
    `Leans on ${main.name} to close your ${Math.round(remaining.protein_g)} g protein gap.`,
  );
  add(
    "plate-balanced",
    "Balanced plate",
    [pick(protein, 2) && toPlateItem(pick(protein, 2)!), pick(carbSides, 1) && toPlateItem(pick(carbSides, 1)!), pick(light, 1) && toPlateItem(pick(light, 1)!)],
    "An even mix of protein and carbs that leaves room for a snack later.",
  );
  add(
    "plate-light",
    "Lighter plate",
    [0, 1, 2].map((i) => pick(light, i)).filter((m, i, arr): m is MenuItem => !!m && arr.indexOf(m) === i).map((m) => toPlateItem(m)),
    "Lower-calorie picks if you're not very hungry or had a big earlier meal.",
  );
  return { plates };
}
