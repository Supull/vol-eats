/*
 * Daily calorie and macro targets (Mifflin-St Jeor).
 * Pure functions only, so the client and a server route can share them.
 *
 * TODO(§7): CONTEXT.md §7 wasn't in the repo when this was written. The
 * activity multipliers, goal adjustments and macro split below are common
 * defaults; confirm them against §7 (or import the teammate's version).
 */
import type { ActivityLevel, GoalType, Macros, Sex } from "./types";

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very_active: 1.725,
};

/** Sex constant in the Mifflin-St Jeor equation. "unspecified" uses the average. */
export const SEX_CONSTANTS: Record<Sex, number> = {
  male: 5,
  female: -161,
  unspecified: -78,
};

/** kcal added to maintenance per goal. */
export const GOAL_CALORIE_DELTA: Record<GoalType, number> = {
  lose_fat: -500,
  build_muscle: 300,
  maintain: 0,
};

/** Protein in grams per kg of body weight, per goal. */
export const PROTEIN_G_PER_KG: Record<GoalType, number> = {
  lose_fat: 2.0,
  build_muscle: 1.8,
  maintain: 1.6,
};

/** Share of calories from fat. Carbs fill the rest. */
export const FAT_CALORIE_SHARE = 0.25;
/** Never recommend fewer calories than this. */
export const MIN_CALORIES = 1200;

export const KCAL_PER_G = { protein: 4, carbs: 4, fat: 9 } as const;

export interface TargetsInput {
  sex: Sex;
  age: number;
  height_cm: number;
  weight_kg: number;
  activity_level: ActivityLevel;
  goal_type: GoalType;
}

export function bmr({ sex, age, height_cm, weight_kg }: Pick<TargetsInput, "sex" | "age" | "height_cm" | "weight_kg">) {
  return 10 * weight_kg + 6.25 * height_cm - 5 * age + SEX_CONSTANTS[sex];
}

export function tdee(input: Omit<TargetsInput, "goal_type">) {
  return bmr(input) * ACTIVITY_MULTIPLIERS[input.activity_level];
}

const roundTo = (n: number, step: number) => Math.round(n / step) * step;

export function computeTargets(input: TargetsInput): Macros {
  const calories = Math.max(MIN_CALORIES, roundTo(tdee(input) + GOAL_CALORIE_DELTA[input.goal_type], 10));

  // Protein is capped so it never exceeds 40% of calories (matters for very heavy users).
  const protein_g = Math.round(
    Math.min(input.weight_kg * PROTEIN_G_PER_KG[input.goal_type], (calories * 0.4) / KCAL_PER_G.protein),
  );
  const fat_g = Math.round((calories * FAT_CALORIE_SHARE) / KCAL_PER_G.fat);
  const carbs_g = Math.max(
    0,
    Math.round((calories - protein_g * KCAL_PER_G.protein - fat_g * KCAL_PER_G.fat) / KCAL_PER_G.carbs),
  );

  return { calories, protein_g, carbs_g, fat_g };
}
