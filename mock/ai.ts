// Canned AI responses for mocks and for the offline fallback when an AI call fails.
import type { Macros, MenuItem, PhotoEstimate, Plate, PlateItem, PlateRecommendation, Profile, TargetsExplanation } from "@/lib/types";
import { sumLogs, targetsOf } from "@/lib/macros";

export const MOCK_PHOTO_ESTIMATE: PhotoEstimate = {
  name: "Grilled chicken, rice and broccoli",
  calories: 620,
  protein_g: 45,
  carbs_g: 68,
  fat_g: 16,
  confidence: "medium",
  notes: "Assumed about 6 oz chicken and 1.5 cups rice. Adjust if your portion was different.",
};

/** What the mock "AI" returns: goal-aware copy. (The real route may also return adjustments.) */
export function mockTargetsExplanation(p: Profile): TargetsExplanation {
  const t = targetsOf(p);
  const goal = {
    lose_fat: "a steady deficit of about 500 calories so you lose roughly a pound a week",
    build_muscle: "a small surplus of about 300 calories so the gain is mostly muscle",
    maintain: "your maintenance calories so your weight stays steady",
  }[p.goal_type];
  return {
    explanation: `We set ${t.calories} calories, ${goal}. ${t.protein_g} g of protein supports your training, and carbs fuel your workouts.`,
  };
}

const sum = (items: PlateItem[]): Macros => sumLogs(items);

const toPlateItem = (m: MenuItem, servings = 1): PlateItem => ({
  menu_item_id: m.id,
  name: m.name,
  servings,
  calories: m.calories,
  protein_g: m.protein_g,
  carbs_g: m.carbs_g,
  fat_g: m.fat_g,
});

/**
 * Builds 3 plausible plates from whatever menu items are available, so the
 * mock works for any hall and period. Not smart — the real AI route replaces it.
 */
export function buildMockPlates(menu: MenuItem[], remaining: Macros): PlateRecommendation {
  if (menu.length === 0) return { plates: [] };
  const location_id = menu[0].location_id;
  const proteinDense = [...menu].sort((a, b) => b.protein_g / Math.max(b.calories, 1) - a.protein_g / Math.max(a.calories, 1));
  const carbSides = [...menu].filter((m) => m.carbs_g >= 20).sort((a, b) => b.carbs_g - a.carbs_g);
  const light = [...menu].filter((m) => m.calories <= 200).sort((a, b) => b.protein_g - a.protein_g);

  const plates: Plate[] = [];
  const add = (id: string, title: string, items: PlateItem[], reason: string) => {
    const unique = items.filter((it, i, arr) => arr.findIndex((x) => x.menu_item_id === it.menu_item_id) === i);
    if (unique.length) plates.push({ id, title, location_id, items: unique, totals: sum(unique), reason });
  };

  const [p1, p2] = proteinDense;
  const side = carbSides[1] ?? carbSides[0];
  add(
    "plate-protein",
    "High-protein plate",
    [toPlateItem(p1, 2), ...(p2 ? [toPlateItem(p2)] : []), ...(carbSides[0] ? [toPlateItem(carbSides[0])] : [])],
    `Leans on ${p1.name.toLowerCase()} to close your ${Math.round(remaining.protein_g)} g protein gap.`,
  );
  add(
    "plate-balanced",
    "Balanced plate",
    [toPlateItem(proteinDense[2] ?? p1), ...(side ? [toPlateItem(side)] : []), ...(light[1] ? [toPlateItem(light[1])] : [])],
    "An even mix of protein and carbs that leaves room for a snack later.",
  );
  add(
    "plate-light",
    "Lighter plate",
    light.slice(0, 3).map((m) => toPlateItem(m)),
    "Lower calorie picks if you're not very hungry or ate a big lunch.",
  );
  return { plates };
}
