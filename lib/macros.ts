import type { FoodLog, Macros, Profile } from "./types";

export const ZERO_MACROS: Macros = { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 };

/** Totals across logs (each log's macros are per serving). */
export function sumLogs(logs: Pick<FoodLog, keyof Macros | "servings">[]): Macros {
  return logs.reduce(
    (t, l) => ({
      calories: t.calories + l.calories * l.servings,
      protein_g: t.protein_g + l.protein_g * l.servings,
      carbs_g: t.carbs_g + l.carbs_g * l.servings,
      fat_g: t.fat_g + l.fat_g * l.servings,
    }),
    ZERO_MACROS,
  );
}

export function targetsOf(p: Pick<Profile, "target_calories" | "target_protein_g" | "target_carbs_g" | "target_fat_g">): Macros {
  return { calories: p.target_calories, protein_g: p.target_protein_g, carbs_g: p.target_carbs_g, fat_g: p.target_fat_g };
}

/** What's left to eat today (never negative). */
export function remaining(targets: Macros, eaten: Macros): Macros {
  return {
    calories: Math.max(0, targets.calories - eaten.calories),
    protein_g: Math.max(0, targets.protein_g - eaten.protein_g),
    carbs_g: Math.max(0, targets.carbs_g - eaten.carbs_g),
    fat_g: Math.max(0, targets.fat_g - eaten.fat_g),
  };
}
